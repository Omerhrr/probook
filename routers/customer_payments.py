from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, selectinload
from typing import List, Optional
from decimal import Decimal
from datetime import date

import database
import models.customer_payment as cp_model
import schemas.customer_payment as cp_schema
import dependencies
from models.branch import Branch as BranchModel
from models.customer import Customer as CustomerModel
from models.account import Account as AccountModel
from models.user import User as UserModel
import models.journal_entry as je_model
import schemas.journal_entry as je_schema
from utils.accounting_helpers import get_branch_accounting_settings #, ESSENTIAL_ACCOUNT_KEYS

router = APIRouter(
    prefix="/customer-payments",
    tags=["Customer Payments"],
    dependencies=[Depends(dependencies.get_admin_or_branch_manager_user)]
)

@router.post("/", response_model=cp_schema.CustomerPayment, status_code=status.HTTP_201_CREATED)
def create_customer_payment(
    payment_data: cp_schema.CustomerPaymentCreate,
    db: Session = Depends(database.get_db),
    current_user: UserModel = Depends(dependencies.get_admin_or_branch_manager_user)
):
    target_branch_id = payment_data.branch_id
    final_branch_id: int

    # Validate Branch and User's access to it
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
    else: # Should not happen
        raise HTTPException(status_code=403, detail="User not authorized to record payments.")

    branch = db.query(BranchModel).filter(BranchModel.id == final_branch_id).first()
    if not branch:
        raise HTTPException(status_code=404, detail=f"Branch with id {final_branch_id} not found.")

    # Validate Customer
    customer = db.query(CustomerModel).filter(CustomerModel.id == payment_data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail=f"Customer with id {payment_data.customer_id} not found.")
    if customer.branch_id != final_branch_id:
        raise HTTPException(status_code=400, detail=f"Customer (ID: {customer.id}) does not belong to the payment's branch (ID: {final_branch_id}).")

    # Validate Payment Method Account (e.g., Cash or Bank account)
    payment_account = db.query(AccountModel).options(selectinload(AccountModel.account_type)).filter(AccountModel.id == payment_data.payment_method_account_id).first()
    if not payment_account:
        raise HTTPException(status_code=404, detail=f"Payment method account with id {payment_data.payment_method_account_id} not found.")
    if payment_account.branch_id != final_branch_id:
        raise HTTPException(status_code=400, detail=f"Payment method account (ID: {payment_account.id}) must belong to the payment's branch (ID: {final_branch_id}).")
    if not payment_account.is_active:
        raise HTTPException(status_code=400, detail=f"Payment method account '{payment_account.name}' is not active.")
    if payment_account.account_type.name.lower() not in ["asset"]: # Typically cash/bank are assets
        raise HTTPException(status_code=400, detail=f"Payment method account '{payment_account.name}' must be an Asset account type.")

    # Fetch A/R account for the branch
    try:
        acc_settings = get_branch_accounting_settings(db, final_branch_id)
        ar_account_id = acc_settings["default_accounts_receivable_account_id"]
    except HTTPException as e: # Catch if settings are not configured
        raise HTTPException(status_code=500, detail=f"Accounting settings error for branch {final_branch_id}: {e.detail}")

    # Start transaction
    try:
        db_payment = cp_model.CustomerPayment(
            **payment_data.model_dump(),
            branch_id=final_branch_id, # Ensure final_branch_id is used
            created_by_user_id=current_user.id
        )
        db.add(db_payment)
        db.flush() # Get ID for JE description if needed

        # Create Journal Entry for the payment
        je_items = [
            je_schema.JournalEntryItemCreate( # Debit Cash/Bank Account
                account_id=db_payment.payment_method_account_id,
                debit_amount=float(db_payment.amount_paid),
                credit_amount=0
            ),
            je_schema.JournalEntryItemCreate( # Credit A/R Account
                account_id=ar_account_id,
                debit_amount=0,
                credit_amount=float(db_payment.amount_paid)
            ),
        ]
        je_data = je_schema.JournalEntryCreate(
            entry_date=db_payment.payment_date,
            description=f"Customer Payment - Customer: {customer.name} (ID: {customer.id}), Ref: {db_payment.reference_number or 'N/A'}",
            branch_id=final_branch_id,
            items=je_items
        )
        db_je = je_model.JournalEntry(
            entry_date=je_data.entry_date,
            description=je_data.description,
            branch_id=je_data.branch_id,
            created_by_user_id=current_user.id
        )
        db.add(db_je)
        db.flush()
        for item_create_data in je_data.items:
            db.add(je_model.JournalEntryItem(journal_entry_id=db_je.id, **item_create_data.model_dump()))

        db.commit()
        db.refresh(db_payment)
        # Eager load for response
        return db.query(cp_model.CustomerPayment).options(
            selectinload(cp_model.CustomerPayment.customer),
            selectinload(cp_model.CustomerPayment.branch),
            selectinload(cp_model.CustomerPayment.payment_account).selectinload(AccountModel.account_type),
            selectinload(cp_model.CustomerPayment.created_by).selectinload(UserModel.role)
        ).filter(cp_model.CustomerPayment.id == db_payment.id).first()

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to record payment and journal entry: {str(e)}")


@router.get("/", response_model=List[cp_schema.CustomerPayment])
def read_customer_payments(
    branch_id_query: Optional[int] = Query(None, alias="branch_id"),
    customer_id_filter: Optional[int] = Query(None, alias="customer_id"),
    payment_date_start: Optional[date] = Query(None),
    payment_date_end: Optional[date] = Query(None),
    payment_method_account_id_filter: Optional[int] = Query(None, alias="payment_method_account_id"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(database.get_db),
    current_user: UserModel = Depends(dependencies.get_admin_or_branch_manager_user)
):
    query = db.query(cp_model.CustomerPayment).options(
        selectinload(cp_model.CustomerPayment.customer),
        selectinload(cp_model.CustomerPayment.branch),
        selectinload(cp_model.CustomerPayment.payment_account).selectinload(AccountModel.account_type),
        selectinload(cp_model.CustomerPayment.created_by).selectinload(UserModel.role)
    )

    if current_user.role.name.lower() == "admin":
        if branch_id_query is not None:
            query = query.filter(cp_model.CustomerPayment.branch_id == branch_id_query)
    elif current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager not assigned to a branch.")
        query = query.filter(cp_model.CustomerPayment.branch_id == current_user.branch_id)
        if branch_id_query is not None and branch_id_query != current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch managers can only view payments for their own branch.")

    if customer_id_filter:
        query = query.filter(cp_model.CustomerPayment.customer_id == customer_id_filter)
    if payment_date_start:
        query = query.filter(cp_model.CustomerPayment.payment_date >= payment_date_start)
    if payment_date_end:
        query = query.filter(cp_model.CustomerPayment.payment_date <= payment_date_end)
    if payment_method_account_id_filter:
        query = query.filter(cp_model.CustomerPayment.payment_method_account_id == payment_method_account_id_filter)

    payments = query.order_by(cp_model.CustomerPayment.payment_date.desc(), cp_model.CustomerPayment.id.desc()).offset(skip).limit(limit).all()
    return payments

@router.get("/{payment_id}", response_model=cp_schema.CustomerPayment)
def read_customer_payment(
    payment_id: int,
    db: Session = Depends(database.get_db),
    current_user: UserModel = Depends(dependencies.get_admin_or_branch_manager_user)
):
    db_payment = db.query(cp_model.CustomerPayment).options(
        selectinload(cp_model.CustomerPayment.customer),
        selectinload(cp_model.CustomerPayment.branch),
        selectinload(cp_model.CustomerPayment.payment_account).selectinload(AccountModel.account_type),
        selectinload(cp_model.CustomerPayment.created_by).selectinload(UserModel.role)
    ).filter(cp_model.CustomerPayment.id == payment_id).first()

    if not db_payment:
        raise HTTPException(status_code=404, detail="Customer payment not found")

    if current_user.role.name.lower() == "admin":
        return db_payment
    elif current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id or db_payment.branch_id != current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager can only view payments from their own branch.")
        return db_payment

    raise HTTPException(status_code=403, detail="Not authorized to view this payment.")
