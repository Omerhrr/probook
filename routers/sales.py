from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional # Added Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query # Added Query
# Remove sqlalchemy.future.select if not used explicitly with new syntax for options
# from sqlalchemy.future import select
from sqlalchemy.orm import Session, selectinload # For eager loading

from database import get_db
from models.user import User as UserModel
from models.product import Product as ProductModel
from models.customer import Customer as CustomerModel
from models.sale import Sale as SaleModel, SaleItem as SaleItemModel
from models.branch import Branch as BranchModel # For branch validation
from schemas.sale import Sale, SaleCreate # SaleItem is implicitly used by Sale schema
# Updated dependencies
from dependencies import get_current_active_user, get_admin_or_branch_manager_user

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
        owner_id=current_user.id, # TODO: Revisit owner_id logic. Should it be branch owner or system owner? For now, creator.
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
    db.add_all(sale_items_to_add) # Add all items

    try:
        db.commit() # Commit the transaction including sale and all its items
        db.refresh(db_sale)
        # Eager load items and customer for the response
        # This can be done by querying again with options or by ensuring relationships are properly loaded
        # For simplicity, Pydantic's orm_mode will try to access them.
        # To be robust, ensure they are loaded, especially items.
        # db.refresh(db_sale, attribute_names=['items', 'customer']) # This might be needed
        # Or query it again:
        # sale_with_details = db.query(SaleModel).options(selectinload(SaleModel.items).selectinload(SaleItemModel.product), selectinload(SaleModel.customer)).filter(SaleModel.id == db_sale.id).first()
        # return sale_with_details
        return db_sale # Assuming orm_mode and session state handle population for response
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error committing sale: {str(e)}")


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
