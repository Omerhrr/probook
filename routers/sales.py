from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, selectinload

from database import get_db
from models.user import User as UserModel
from models.product import Product as ProductModel
from models.customer import Customer as CustomerModel
from models.sale import Sale as SaleModel, SaleItem as SaleItemModel
from models.branch import Branch as BranchModel
from models.account import Account as AccountModel # For COGS item account validation
import models.journal_entry as je_model # For creating JournalEntry
import schemas.journal_entry as je_schema # For JournalEntryCreate schema
from schemas.sale import Sale, SaleCreate
from dependencies import get_current_active_user, get_admin_or_branch_manager_user
from decimal import Decimal # For precise calculations

router = APIRouter(
    prefix="/sales",
    tags=["sales"]
    # Dependencies applied per-route
)

@router.post("/", response_model=Sale, status_code=status.HTTP_201_CREATED)
def create_sale(
    sale_data: SaleCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_admin_or_branch_manager_user) # Admin or BM can create Sales
):
    target_branch_id = sale_data.branch_id
    final_branch_id: int

    if current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager not assigned to a branch.")
        if target_branch_id != current_user.branch_id:
            raise HTTPException(status_code=403, detail=f"Branch managers can only create sales for their own branch (Branch ID: {current_user.branch_id}).")
        final_branch_id = current_user.branch_id
    elif current_user.role.name.lower() == "admin":
        if not target_branch_id:
            raise HTTPException(status_code=400, detail="Admin must specify a branch_id for the sale.")
        final_branch_id = target_branch_id
    else: # Should not be reached due to dependency
        raise HTTPException(status_code=403, detail="Not authorized to create sales.")

    # Validate branch existence
    if not db.query(BranchModel).filter(BranchModel.id == final_branch_id).first():
        raise HTTPException(status_code=404, detail=f"Branch with id {final_branch_id} not found.")

    # Validate customer if provided and ensure customer belongs to the same branch
    customer = None
    if sale_data.customer_id:
        customer = db.query(CustomerModel).filter(CustomerModel.id == sale_data.customer_id).first()
        if not customer:
            raise HTTPException(status_code=404, detail=f"Customer with id {sale_data.customer_id} not found.")
        if customer.branch_id != final_branch_id:
            raise HTTPException(status_code=400, detail=f"Customer (ID: {customer.id}) does not belong to the target branch (ID: {final_branch_id}).")

    # Create SaleModel instance (without items first)
    db_sale = SaleModel(
        customer_id=sale_data.customer_id,
        user_id=current_user.id, # User making the sale
        owner_id=current_user.id, # owner_id is currently set to current_user.id (the creator), same as user_id.
                                  # This maintains simplicity. Future enhancements might allow assigning a specific salesperson as owner.
        branch_id=final_branch_id,
        total_amount=0 # Will be calculated
    )
    db.add(db_sale)
    # Try to flush to get db_sale.id for items, but manage transaction carefully
    try:
        db.flush() # Use flush to get ID before full commit
    except Exception as e: # Catch DB errors before proceeding
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating sale record: {str(e)}")


    calculated_total_sale_amount = 0.0
    sale_items_to_add = []

    for item_data in sale_data.items:
        product = db.query(ProductModel).filter(ProductModel.id == item_data.product_id).first()
        if not product:
            db.rollback() # Rollback if any product is invalid
            raise HTTPException(status_code=404, detail=f"Product with id {item_data.product_id} not found.")

        # Ensure product belongs to the same branch as the sale
        if product.branch_id != final_branch_id:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Product (ID: {product.id}, Name: {product.name}) does not belong to the target branch (ID: {final_branch_id}).")

        if item_data.quantity <= 0:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Quantity for product id {item_data.product_id} must be positive.")

        unit_price = item_data.unit_price if item_data.unit_price is not None else product.selling_price
        if unit_price is None: # Should ideally not happen if selling_price is mandatory on product
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Selling price for product id {item_data.product_id} not available and not provided in sale.")

        item_total_price = item_data.quantity * unit_price
        calculated_total_sale_amount += item_total_price

        db_sale_item = SaleItemModel(
            sale_id=db_sale.id, # ID from flushed db_sale
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            unit_price=unit_price,
            total_price=item_total_price
        )
        sale_items_to_add.append(db_sale_item)

    db_sale.total_amount = calculated_total_sale_amount
    db.add_all(sale_items_to_add)
    db_sale.total_amount = calculated_total_sale_amount # Ensure total amount is set on the sale model instance

    # At this point, Sale and SaleItems are staged. Now, create Journal Entries.
    # This entire block (Sale + JEs) should be in one transaction.
    try:
        # Fetch accounting settings for the branch
        from utils.accounting_helpers import get_branch_accounting_settings, ESSENTIAL_ACCOUNT_KEYS
        acc_settings = get_branch_accounting_settings(db, final_branch_id)

        # 1. Journal Entry for Sale Revenue & Accounts Receivable
        je_sale_items = [
            je_schema.JournalEntryItemCreate( # Debit A/R
                account_id=acc_settings["default_accounts_receivable_account_id"],
                debit_amount=float(db_sale.total_amount),
                credit_amount=0
            ),
            je_schema.JournalEntryItemCreate( # Credit Sales Revenue
                account_id=acc_settings["default_sales_revenue_account_id"],
                debit_amount=0,
                credit_amount=float(db_sale.total_amount)
            ),
        ]
        je_sale_data = je_schema.JournalEntryCreate(
            entry_date=db_sale.sale_date,
            description=f"Sale - Invoice for customer_id: {db_sale.customer_id or 'N/A'}", # Refine description
            branch_id=final_branch_id,
            items=je_sale_items
        )
        # Use the create_journal_entry logic (or a direct model creation)
        # For simplicity, directly creating models for JE here:
        db_je_sale = je_model.JournalEntry(
            entry_date=je_sale_data.entry_date,
            description=je_sale_data.description,
            branch_id=je_sale_data.branch_id,
            created_by_user_id=current_user.id
        )
        db.add(db_je_sale)
        db.flush() # Get ID for items
        for item_create_data in je_sale_data.items:
            db.add(je_model.JournalEntryItem(
                journal_entry_id=db_je_sale.id, **item_create_data.model_dump()
            ))

        # 2. Journal Entry for COGS & Inventory
        # Calculate total COGS for the sale. Product cost needs to be stored/fetched.
        # Assuming ProductModel has a 'cost_price' or similar field.
        # For this example, let's assume 'purchase_price' on ProductModel is the cost.
        # This was not explicitly added to sales_order items in previous PHP analysis, but 'cost' was.
        # We need to ensure product.purchase_price is the cost of one unit.

        total_cogs = Decimal('0.00')
        for item_data in sale_data.items: # Iterate original sale_data for product_id and qty
            product = db.query(ProductModel).filter(ProductModel.id == item_data.product_id).first()
            # Assuming product.purchase_price is the cost of one unit.
            # This should be the cost at the time of sale, not current cost if it changes.
            # Ideally, this cost should be captured when sales_order_items are created if not already.
            # For now, using current product.purchase_price as cost_price.
            if product and product.purchase_price is not None: # product.purchase_price is cost
                 total_cogs += Decimal(str(product.purchase_price)) * Decimal(item_data.quantity)
            else:
                # Handle missing cost price - this might be an error or a service item
                # For now, if product cost is unknown, COGS entry for that item might be skipped or error raised.
                # Let's assume for now products always have a purchase_price if they affect inventory.
                pass # Or raise error: HTTPException(status_code=400, detail=f"Cost price not found for product ID {item_data.product_id}")


        if total_cogs > 0: # Only create COGS entry if there's a cost involved
            je_cogs_items = [
                je_schema.JournalEntryItemCreate( # Debit COGS
                    account_id=acc_settings["default_cogs_account_id"],
                    debit_amount=float(total_cogs),
                    credit_amount=0
                ),
                je_schema.JournalEntryItemCreate( # Credit Inventory
                    account_id=acc_settings["default_inventory_account_id"],
                    debit_amount=0,
                    credit_amount=float(total_cogs)
                ),
            ]
            je_cogs_data = je_schema.JournalEntryCreate(
                entry_date=db_sale.sale_date,
                description=f"COGS for Sale - Invoice for customer_id: {db_sale.customer_id or 'N/A'}",
                branch_id=final_branch_id,
                items=je_cogs_items
            )
            db_je_cogs = je_model.JournalEntry(
                entry_date=je_cogs_data.entry_date,
                description=je_cogs_data.description,
                branch_id=je_cogs_data.branch_id,
                created_by_user_id=current_user.id
            )
            db.add(db_je_cogs)
            db.flush()
            for item_create_data in je_cogs_data.items:
                db.add(je_model.JournalEntryItem(
                    journal_entry_id=db_je_cogs.id, **item_create_data.model_dump()
                ))

        db.commit()
        db.refresh(db_sale)
        # Eager load for response
        return db.query(SaleModel).options(
            selectinload(SaleModel.items).selectinload(SaleItemModel.product),
            selectinload(SaleModel.customer),
            selectinload(SaleModel.branch)
        ).filter(SaleModel.id == db_sale.id).first()

    except HTTPException as he: # Catch specific HTTP exceptions from helpers like get_branch_accounting_settings
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error committing sale and creating journal entries: {str(e)}")


@router.get("/{sale_id}", response_model=Sale)
def read_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    # Eager load related data for the response
    query = db.query(SaleModel).options(
        selectinload(SaleModel.items).selectinload(SaleItemModel.product),
        selectinload(SaleModel.customer),
        selectinload(SaleModel.branch) # Also load branch for the sale
    )
    db_sale = query.filter(SaleModel.id == sale_id).first()

    if db_sale is None:
        raise HTTPException(status_code=404, detail="Sale not found")

    if current_user.role.name.lower() == "admin":
        return db_sale
    elif current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id or db_sale.branch_id != current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager can only view sales from their own branch.")
        return db_sale
    else: # Potentially other user roles, e.g., a regular user viewing their own sales (if customer_id matches user_id related field)
          # For now, only admin/BM can view specific sales like this.
        raise HTTPException(status_code=403, detail="Not authorized to view this sale.")


@router.get("/", response_model=List[Sale])
def read_sales(
    branch_id: Optional[int] = Query(None),
    customer_id: Optional[int] = Query(None), # Filter by customer
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    query = db.query(SaleModel).options(
        selectinload(SaleModel.items).selectinload(SaleItemModel.product), # Eager load for list
        selectinload(SaleModel.customer),
        selectinload(SaleModel.branch)
    )

    if current_user.role.name.lower() == "admin":
        if branch_id:
            query = query.filter(SaleModel.branch_id == branch_id)
    elif current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager not assigned to a branch.")
        query = query.filter(SaleModel.branch_id == current_user.branch_id)
        if branch_id and branch_id != current_user.branch_id: # BM cannot query other branches
            raise HTTPException(status_code=403, detail="Branch managers can only list sales for their own branch.")
    else:
        # Regular users might see their own sales if `customer_id` is linked to `user.id`
        # Or if there's a `user_id` on Sale that links to `current_user.id` (e.g. if users are also customers)
        # For now, restrict general listing.
        raise HTTPException(status_code=403, detail="Not authorized to list sales.")

    if customer_id:
        query = query.filter(SaleModel.customer_id == customer_id)
        # Additional check: if BM, ensure customer is from their branch
        if current_user.role.name.lower() == "branch_manager":
            customer = db.query(CustomerModel).filter(CustomerModel.id == customer_id).first()
            if customer and customer.branch_id != current_user.branch_id:
                # Return empty list or error if trying to filter by customer from another branch
                return [] # Or raise HTTPException

    sales = query.order_by(SaleModel.sale_date.desc()).offset(skip).limit(limit).all()
    return sales
