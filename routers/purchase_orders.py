from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, selectinload
from typing import List, Optional
from decimal import Decimal
from datetime import date

import database
import models.purchase_order as po_model
import schemas.purchase_order as po_schema
import dependencies
from models.branch import Branch as BranchModel
from models.supplier import Supplier as SupplierModel
from models.product import Product as ProductModel
from models.user import User as UserModel
import models.journal_entry as je_model
import schemas.journal_entry as je_schema
from utils.accounting_helpers import get_branch_accounting_settings

router = APIRouter(
    prefix="/purchase-orders",
    tags=["Purchase Orders"],
    dependencies=[Depends(dependencies.get_admin_or_branch_manager_user)]
)

@router.post("/", response_model=po_schema.PurchaseOrder, status_code=status.HTTP_201_CREATED)
def create_purchase_order(
    po_data: po_schema.PurchaseOrderCreate,
    db: Session = Depends(database.get_db),
    current_user: UserModel = Depends(dependencies.get_admin_or_branch_manager_user)
):
    target_branch_id = po_data.branch_id
    final_branch_id: int

    if current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager not assigned to a branch.")
        if target_branch_id != current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch managers can only create POs for their own branch.")
        final_branch_id = current_user.branch_id
    elif current_user.role.name.lower() == "admin":
        if not target_branch_id:
            raise HTTPException(status_code=400, detail="Admin must specify a branch_id for the PO.")
        final_branch_id = target_branch_id
    else:
        raise HTTPException(status_code=403, detail="Not authorized.")

    if not db.query(BranchModel).filter(BranchModel.id == final_branch_id).first():
        raise HTTPException(status_code=404, detail=f"Branch with id {final_branch_id} not found.")

    supplier = db.query(SupplierModel).filter(SupplierModel.id == po_data.supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail=f"Supplier with id {po_data.supplier_id} not found.")
    if supplier.branch_id != final_branch_id: # Assuming suppliers are branch-specific for this validation
        raise HTTPException(status_code=400, detail=f"Supplier (ID: {supplier.id}) does not belong to the target branch (ID: {final_branch_id}).")

    calculated_total_amount = Decimal('0.00')
    po_items_to_create = []

    for item_data in po_data.items:
        product = db.query(ProductModel).filter(ProductModel.id == item_data.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with id {item_data.product_id} not found.")
        if product.branch_id != final_branch_id: # Products must belong to the PO's branch
            raise HTTPException(status_code=400, detail=f"Product '{product.name}' does not belong to branch {final_branch_id}.")

        total_item_cost = Decimal(item_data.quantity) * Decimal(item_data.unit_cost)
        calculated_total_amount += total_item_cost
        po_items_to_create.append(po_model.PurchaseOrderItem(
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            unit_cost=item_data.unit_cost,
            total_cost=total_item_cost
            # purchase_order_id will be set by SQLAlchemy relationship
        ))

    db_po = po_model.PurchaseOrder(
        order_date=po_data.order_date,
        supplier_id=po_data.supplier_id,
        branch_id=final_branch_id,
        total_amount=calculated_total_amount,
        status=po_data.status, # e.g., "Received"
        notes=po_data.notes,
        created_by_user_id=current_user.id,
        items=po_items_to_create # Assign items to the relationship
    )
    db.add(db_po)

    # Update Product Stock and Purchase Price
    for item_model in po_items_to_create:
        product_to_update = db.query(ProductModel).filter(ProductModel.id == item_model.product_id).first() # Should always find
        if product_to_update:
            product_to_update.opening_stock = (product_to_update.opening_stock or 0) + Decimal(item_model.quantity)
            product_to_update.purchase_price = Decimal(item_model.unit_cost) # Update to latest cost
            db.add(product_to_update)

    # Automated Journal Entry if status is "Received"
    if db_po.status.lower() == "received":
        try:
            acc_settings = get_branch_accounting_settings(db, final_branch_id)
            inventory_acc_id = acc_settings["default_inventory_account_id"]
            ap_acc_id = acc_settings["default_accounts_payable_account_id"]

            # Validate accounts
            inv_account = db.query(AccountModel).options(selectinload(AccountModel.account_type)).filter(AccountModel.id == inventory_acc_id).first()
            ap_account = db.query(AccountModel).options(selectinload(AccountModel.account_type)).filter(AccountModel.id == ap_acc_id).first()

            if not inv_account or not inv_account.is_active or inv_account.account_type.name.lower() != "asset":
                raise HTTPException(status_code=400, detail="Default Inventory Account is invalid, inactive, or not an Asset type.")
            if not ap_account or not ap_account.is_active or ap_account.account_type.name.lower() != "liability":
                 raise HTTPException(status_code=400, detail="Default Accounts Payable Account is invalid, inactive, or not a Liability type.")

            je_items = [
                je_schema.JournalEntryItemCreate(account_id=inventory_acc_id, debit_amount=float(db_po.total_amount), credit_amount=0),
                je_schema.JournalEntryItemCreate(account_id=ap_acc_id, debit_amount=0, credit_amount=float(db_po.total_amount))
            ]
            je_data = je_schema.JournalEntryCreate(
                entry_date=db_po.order_date,
                description=f"Inventory Purchase - PO ID: {db_po.id or '(pending)'}, Supplier: {supplier.name}", # db_po.id might not be available before flush
                branch_id=final_branch_id,
                items=je_items
            )
            db_je = je_model.JournalEntry(
                entry_date=je_data.entry_date, description=je_data.description, branch_id=je_data.branch_id, created_by_user_id=current_user.id
            )
            db.add(db_je)
            db.flush() # Get JE ID for items
            for item_data in je_data.items:
                db.add(je_model.JournalEntryItem(journal_entry_id=db_je.id, **item_data.model_dump()))

            # Update JE description with PO ID if it was pending
            if "(pending)" in db_je.description:
                 db.flush() # ensure db_po has an id
                 db_je.description = f"Inventory Purchase - PO ID: {db_po.id}, Supplier: {supplier.name}"


        except HTTPException as he: # Catch settings error specifically
            db.rollback()
            raise he
        except Exception as e_je:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to create journal entry for purchase: {str(e_je)}")

    try:
        db.commit()
        db.refresh(db_po)
        # Eager load for response
        return db.query(po_model.PurchaseOrder).options(
            selectinload(po_model.PurchaseOrder.items).selectinload(po_model.PurchaseOrderItem.product),
            selectinload(po_model.PurchaseOrder.supplier),
            selectinload(po_model.PurchaseOrder.branch),
            selectinload(po_model.PurchaseOrder.created_by)
        ).filter(po_model.PurchaseOrder.id == db_po.id).first()
    except Exception as e_commit:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to commit purchase order and related records: {str(e_commit)}")


@router.get("/", response_model=List[po_schema.PurchaseOrder])
def read_purchase_orders(
    branch_id_query: Optional[int] = Query(None, alias="branch_id"),
    supplier_id_filter: Optional[int] = Query(None, alias="supplier_id"),
    status_filter: Optional[str] = Query(None, alias="status"),
    order_date_start: Optional[date] = Query(None),
    order_date_end: Optional[date] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(database.get_db),
    current_user: UserModel = Depends(dependencies.get_admin_or_branch_manager_user)
):
    query = db.query(po_model.PurchaseOrder).options(
        selectinload(po_model.PurchaseOrder.supplier),
        selectinload(po_model.PurchaseOrder.branch),
        selectinload(po_model.PurchaseOrder.created_by)
        # Items are not typically loaded in list view for performance, but can be if needed
    )

    if current_user.role.name.lower() == "admin":
        if branch_id_query is not None:
            query = query.filter(po_model.PurchaseOrder.branch_id == branch_id_query)
    elif current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager not assigned to a branch.")
        query = query.filter(po_model.PurchaseOrder.branch_id == current_user.branch_id)
        if branch_id_query is not None and branch_id_query != current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch managers can only view POs for their own branch.")

    if supplier_id_filter:
        query = query.filter(po_model.PurchaseOrder.supplier_id == supplier_id_filter)
    if status_filter:
        query = query.filter(po_model.PurchaseOrder.status.ilike(f"%{status_filter}%"))
    if order_date_start:
        query = query.filter(po_model.PurchaseOrder.order_date >= order_date_start)
    if order_date_end:
        query = query.filter(po_model.PurchaseOrder.order_date <= order_date_end)

    purchase_orders = query.order_by(po_model.PurchaseOrder.order_date.desc(), po_model.PurchaseOrder.id.desc()).offset(skip).limit(limit).all()
    return purchase_orders


@router.get("/{po_id}", response_model=po_schema.PurchaseOrder)
def read_purchase_order(
    po_id: int,
    db: Session = Depends(database.get_db),
    current_user: UserModel = Depends(dependencies.get_admin_or_branch_manager_user)
):
    db_po = db.query(po_model.PurchaseOrder).options(
        selectinload(po_model.PurchaseOrder.items).selectinload(po_model.PurchaseOrderItem.product).selectinload(ProductModel.account_type), # Load deeply for item details
        selectinload(po_model.PurchaseOrder.supplier),
        selectinload(po_model.PurchaseOrder.branch),
        selectinload(po_model.PurchaseOrder.created_by)
    ).filter(po_model.PurchaseOrder.id == po_id).first()

    if not db_po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")

    if current_user.role.name.lower() == "admin":
        return db_po
    elif current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id or db_po.branch_id != current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager can only view POs from their own branch.")
        return db_po

    raise HTTPException(status_code=403, detail="Not authorized.")
