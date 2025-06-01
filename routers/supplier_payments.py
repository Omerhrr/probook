from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, selectinload
from typing import List, Optional
from decimal import Decimal
from datetime import date

import database
import models.supplier_payment as sp_model
import schemas.supplier_payment as sp_schema
import dependencies
from models.branch import Branch as BranchModel
from models.supplier import Supplier as SupplierModel
from models.account import Account as AccountModel
from models.user import User as UserModel
import models.journal_entry as je_model
import schemas.journal_entry as je_schema
from utils.accounting_helpers import get_branch_accounting_settings

router = APIRouter(
    prefix="/supplier-payments",
    tags=["Supplier Payments"],
    dependencies=[Depends(dependencies.get_admin_or_branch_manager_user)]
)

@router.post("/", response_model=sp_schema.SupplierPayment, status_code=status.HTTP_201_CREATED)
def create_supplier_payment(
    payment_data: sp_schema.SupplierPaymentCreate,
    db: Session = Depends(database.get_db),
    current_user: UserModel = Depends(dependencies.get_admin_or_branch_manager_user)
):
    target_branch_id = payment_data.branch_id
    final_branch_id: int

    if current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager not assigned to a branch.")
        if target_branch_id != current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch managers can only record payments for their own branch.")
        final_branch_id = current_user.branch_id
    elif current_user.role.name.lower() == "admin":
        if not target_branch_id:
            raise HTTPException(status_code=400, detail="Admin must specify a branch_id for the payment.")
        final_branch_id = target_branch_id
    else:
        raise HTTPException(status_code=403, detail="User not authorized.")

    branch = db.query(BranchModel).filter(BranchModel.id == final_branch_id).first()
    if not branch:
        raise HTTPException(status_code=404, detail=f"Branch with id {final_branch_id} not found.")

    supplier = db.query(SupplierModel).filter(SupplierModel.id == payment_data.supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail=f"Supplier with id {payment_data.supplier_id} not found.")
    if supplier.branch_id != final_branch_id:
        raise HTTPException(status_code=400, detail=f"Supplier (ID: {supplier.id}) does not belong to the payment's branch (ID: {final_branch_id}).")

    payment_account = db.query(AccountModel).options(selectinload(AccountModel.account_type)).filter(AccountModel.id == payment_data.payment_method_account_id).first()
    if not payment_account:
        raise HTTPException(status_code=404, detail=f"Payment method account with id {payment_data.payment_method_account_id} not found.")
    if payment_account.branch_id != final_branch_id:
        raise HTTPException(status_code=400, detail=f"Payment method account (ID: {payment_account.id}) must belong to the payment's branch (ID: {final_branch_id}).")
    if not payment_account.is_active:
        raise HTTPException(status_code=400, detail=f"Payment method account '{payment_account.name}' is not active.")
    if payment_account.account_type.name.lower() not in ["asset"]:
        raise HTTPException(status_code=400, detail=f"Payment method account '{payment_account.name}' must be an Asset account type.")

    try:
        acc_settings = get_branch_accounting_settings(db, final_branch_id)
        ap_account_id = acc_settings["default_accounts_payable_account_id"]

        ap_account_validation = db.query(AccountModel).options(selectinload(AccountModel.account_type)).filter(AccountModel.id == ap_account_id).first()
        if not ap_account_validation or not ap_account_validation.is_active or ap_account_validation.account_type.name.lower() != "liability":
            raise HTTPException(status_code=500, detail=f"Default Accounts Payable account (ID: {ap_account_id}) is invalid, inactive, or not a Liability type for branch {final_branch_id}.")

    except HTTPException as he:
        raise he # Re-raise settings validation errors
    except KeyError: # Specifically for missing keys in acc_settings
        raise HTTPException(status_code=500, detail=f"Default Accounts Payable account not configured for branch {final_branch_id}.")


    try:
        db_payment = sp_model.SupplierPayment(
            **payment_data.model_dump(),
            branch_id=final_branch_id,
            created_by_user_id=current_user.id
        )
        db.add(db_payment)
        db.flush()

        je_items = [
            je_schema.JournalEntryItemCreate(account_id=ap_account_id, debit_amount=float(db_payment.amount_paid), credit_amount=0),
            je_schema.JournalEntryItemCreate(account_id=db_payment.payment_method_account_id, debit_amount=0, credit_amount=float(db_payment.amount_paid))
        ]
        je_data = je_schema.JournalEntryCreate(
            entry_date=db_payment.payment_date,
            description=f"Supplier Payment - Supplier: {supplier.name} (ID: {supplier.id}), Ref: {db_payment.reference_number or 'N/A'}",
            branch_id=final_branch_id,
            items=je_items
        )
        db_je = je_model.JournalEntry(entry_date=je_data.entry_date, description=je_data.description, branch_id=je_data.branch_id, created_by_user_id=current_user.id)
        db.add(db_je)
        db.flush()
        for item_data in je_data.items:
            db.add(je_model.JournalEntryItem(journal_entry_id=db_je.id, **item_data.model_dump()))

        db.commit()
        db.refresh(db_payment)
        return db.query(sp_model.SupplierPayment).options(
            selectinload(sp_model.SupplierPayment.supplier),
            selectinload(sp_model.SupplierPayment.branch),
            selectinload(sp_model.SupplierPayment.payment_account).selectinload(AccountModel.account_type),
            selectinload(sp_model.SupplierPayment.created_by).selectinload(UserModel.role)
        ).filter(sp_model.SupplierPayment.id == db_payment.id).first()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to record payment and journal entry: {str(e)}")

@router.get("/", response_model=List[sp_schema.SupplierPayment])
def read_supplier_payments(
    branch_id_query: Optional[int] = Query(None, alias="branch_id"),
    supplier_id_filter: Optional[int] = Query(None, alias="supplier_id"),
    payment_date_start: Optional[date] = Query(None),
    payment_date_end: Optional[date] = Query(None),
    payment_method_account_id_filter: Optional[int] = Query(None, alias="payment_method_account_id"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(database.get_db),
    current_user: UserModel = Depends(dependencies.get_admin_or_branch_manager_user)
):
    query = db.query(sp_model.SupplierPayment).options(
        selectinload(sp_model.SupplierPayment.supplier),
        selectinload(sp_model.SupplierPayment.branch),
        selectinload(sp_model.SupplierPayment.payment_account).selectinload(AccountModel.account_type),
        selectinload(sp_model.SupplierPayment.created_by).selectinload(UserModel.role)
    )

    if current_user.role.name.lower() == "admin":
        if branch_id_query is not None:
            query = query.filter(sp_model.SupplierPayment.branch_id == branch_id_query)
    elif current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager not assigned to a branch.")
        query = query.filter(sp_model.SupplierPayment.branch_id == current_user.branch_id)
        if branch_id_query is not None and branch_id_query != current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch managers can only view payments for their own branch.")

    if supplier_id_filter: query = query.filter(sp_model.SupplierPayment.supplier_id == supplier_id_filter)
    if payment_date_start: query = query.filter(sp_model.SupplierPayment.payment_date >= payment_date_start)
    if payment_date_end: query = query.filter(sp_model.SupplierPayment.payment_date <= payment_date_end)
    if payment_method_account_id_filter: query = query.filter(sp_model.SupplierPayment.payment_method_account_id == payment_method_account_id_filter)

    payments = query.order_by(sp_model.SupplierPayment.payment_date.desc(), sp_model.SupplierPayment.id.desc()).offset(skip).limit(limit).all()
    return payments

@router.get("/{payment_id}", response_model=sp_schema.SupplierPayment)
def read_supplier_payment(
    payment_id: int,
    db: Session = Depends(database.get_db),
    current_user: UserModel = Depends(dependencies.get_admin_or_branch_manager_user)
):
    db_payment = db.query(sp_model.SupplierPayment).options(
        selectinload(sp_model.SupplierPayment.supplier),
        selectinload(sp_model.SupplierPayment.branch),
        selectinload(sp_model.SupplierPayment.payment_account).selectinload(AccountModel.account_type),
        selectinload(sp_model.SupplierPayment.created_by).selectinload(UserModel.role)
    ).filter(sp_model.SupplierPayment.id == payment_id).first()

    if not db_payment:
        raise HTTPException(status_code=404, detail="Supplier payment not found")

    if current_user.role.name.lower() == "admin":
        return db_payment
    elif current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id or db_payment.branch_id != current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager can only view payments from their own branch.")
        return db_payment

    raise HTTPException(status_code=403, detail="Not authorized.")
