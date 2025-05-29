from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session

from app.crud import crud_product, crud_branch, crud_supplier
from app.schemas.product_schemas import Product, ProductCreate, ProductUpdate, StockAdjustment # Imported StockAdjustment
from app.db.session import get_db
from app.models.models import User
from app.core.security import get_current_active_user

router = APIRouter()

@router.post("/", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_new_product(
    product: ProductCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    # Validate branch_id
    branch = crud_branch.get_branch(db, branch_id=product.branch_id)
    if not branch:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid branch ID: {product.branch_id}. Branch does not exist.",
        )
    
    # Validate supplier_id if provided
    if product.supplier_id is not None:
        supplier = crud_supplier.get_supplier(db, supplier_id=product.supplier_id)
        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid supplier ID: {product.supplier_id}. Supplier does not exist.",
            )
            
    # Check for product_code uniqueness
    existing_product = crud_product.get_product_by_code(db, product_code=product.product_code)
    if existing_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with code '{product.product_code}' already exists.",
        )
        
    created_product = crud_product.create_product(db=db, product=product)
    # crud_product.create_product handles internal validation returning None, but primary checks are above
    if created_product is None: 
        # This would be redundant if above checks are comprehensive
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to create product due to an unexpected error."
        )
    return created_product

@router.get("/", response_model=List[Product])
def read_all_products(
    branch_id: Optional[int] = None,
    supplier_id: Optional[int] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if branch_id is not None and supplier_id is not None:
        # Example: Filter by both, you might need a specific CRUD for this or adjust existing ones
        # For now, let's assume this specific combined filter is not directly supported by a single CRUD
        # and we prioritize branch_id then filter further, or adjust based on requirements.
        # This example will filter by branch, then could manually filter by supplier if needed,
        # or ideally, add a CRUD function like get_products_by_branch_and_supplier.
        # Keeping it simple for now:
        branch = crud_branch.get_branch(db, branch_id=branch_id)
        if not branch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Branch with ID {branch_id} not found.")
        products = crud_product.get_products_by_branch(db, branch_id=branch_id, skip=skip, limit=limit)
        # Further filter by supplier_id if that's a requirement for combined query
        if supplier_id is not None:
            products = [p for p in products if p.supplier_id == supplier_id]

    elif branch_id is not None:
        branch = crud_branch.get_branch(db, branch_id=branch_id)
        if not branch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Branch with ID {branch_id} not found.")
        products = crud_product.get_products_by_branch(db, branch_id=branch_id, skip=skip, limit=limit)
    elif supplier_id is not None:
        supplier = crud_supplier.get_supplier(db, supplier_id=supplier_id)
        if not supplier:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Supplier with ID {supplier_id} not found.")
        products = crud_product.get_products_by_supplier(db, supplier_id=supplier_id, skip=skip, limit=limit)
    else:
        products = crud_product.get_products(db, skip=skip, limit=limit)
    return products

@router.get("/{product_id}", response_model=Product)
def read_single_product(
    product_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_product = crud_product.get_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return db_product

@router.put("/{product_id}", response_model=Product)
def update_existing_product(
    product_id: int, 
    product: ProductUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_product = crud_product.get_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    # Validate branch_id if changed
    if product.branch_id is not None and product.branch_id != db_product.branch_id:
        branch = crud_branch.get_branch(db, branch_id=product.branch_id)
        if not branch:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid new branch ID: {product.branch_id}.")
    
    # Validate supplier_id if changed (and not being unset)
    if product.supplier_id is not None and product.supplier_id != db_product.supplier_id:
        supplier = crud_supplier.get_supplier(db, supplier_id=product.supplier_id)
        if not supplier:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid new supplier ID: {product.supplier_id}.")
    
    # Validate product_code uniqueness if changed
    if product.product_code is not None and product.product_code != db_product.product_code:
        existing_product = crud_product.get_product_by_code(db, product_code=product.product_code)
        if existing_product and existing_product.id != product_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with code '{product.product_code}' already exists.",
            )
            
    updated_product = crud_product.update_product(db=db, product_db_obj=db_product, product_in=product)
    if updated_product is None:
        # This could happen if internal CRUD validation fails, e.g., due to product_code uniqueness check in CRUD
         raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, # Or 400 if more specific
            detail="Failed to update product." 
        )
    return updated_product

@router.delete("/{product_id}", response_model=Product)
def delete_existing_product(
    product_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    deleted_product = crud_product.delete_product(db, product_id=product_id)
    if deleted_product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return deleted_product

@router.post("/{product_id}/adjust_stock", response_model=Product)
def adjust_product_stock_endpoint(
    product_id: int,
    adjustment: StockAdjustment,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user) # Ensure user is authenticated
):
    product = crud_product.get_product(db, product_id=product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    try:
        updated_product = crud_product.adjust_product_stock(db=db, product_db_obj=product, adjustment=adjustment)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    
    return updated_product
