from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from typing import List, Optional # Added Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query # Added Query
from sqlalchemy.orm import Session

from database import get_db
from models.user import User as UserModel
from models.product import Product as ProductModel
from schemas.product import Product, ProductCreate, ProductUpdate
# Updated dependencies
from dependencies import get_current_active_user, get_current_admin_user, get_current_branch_manager_user, get_admin_or_branch_manager_user

router = APIRouter(
    prefix="/products",
    tags=["products"]
    # Dependencies will be applied per route now
)

@router.post("/", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_admin_or_branch_manager_user) # Admin or Branch Manager can create
):
    # ProductCreate schema now expects branch_id
    target_branch_id = product_data.branch_id

    if current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id:
             raise HTTPException(status_code=403, detail="Branch manager not assigned to a branch.")
        if target_branch_id != current_user.branch_id:
            raise HTTPException(status_code=403, detail=f"Branch managers can only create products for their own branch (Branch ID: {current_user.branch_id}).")
        # Ensure product data uses manager's branch_id
        final_branch_id = current_user.branch_id
    elif current_user.role.name.lower() == "admin":
        if not target_branch_id: # Admin must specify branch_id if creating product
            raise HTTPException(status_code=400, detail="Admin must specify a branch_id for the product.")
        # Admin can create for any branch, so target_branch_id is used directly if valid
        # (Assuming branch_id in product_data is validated if it exists)
        final_branch_id = target_branch_id
    else: # Should not happen due to dependency
        raise HTTPException(status_code=403, detail="Not authorized to create products.")

    # Ensure the specified branch exists (important for admin)
    from models.branch import Branch as BranchModel
    if not db.query(BranchModel).filter(BranchModel.id == final_branch_id).first():
        raise HTTPException(status_code=404, detail=f"Branch with id {final_branch_id} not found.")

    # Create product with validated/assigned branch_id
    # Remove branch_id from product_data if it was part of schema but we use final_branch_id
    # The ProductCreate schema has branch_id, so it's fine.
    # We ensure the model gets the correct final_branch_id.

    # The ProductCreate schema has branch_id, so model_dump() will include it.
    # We need to ensure the `final_branch_id` is what's used.
    product_dict = product_data.model_dump()
    product_dict['branch_id'] = final_branch_id # Override with the final determined branch_id

    db_product = ProductModel(**product_dict, owner_id=current_user.id)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/{product_id}", response_model=Product)
def read_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user) # Any active user can attempt
):
    db_product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    if current_user.role.name.lower() == "admin":
        return db_product # Admin can see any product
    elif current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id or db_product.branch_id != current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager can only view products from their own branch.")
        return db_product
    else: # Other roles (if any) - default to no access for now
        raise HTTPException(status_code=403, detail="Not authorized to view this product.")

@router.get("/", response_model=List[Product])
def read_products(
    branch_id: Optional[int] = Query(None), # For admin filtering
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200), # Max limit 200 for example
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user) # Any active user can attempt
):
    query = db.query(ProductModel)
    if current_user.role.name.lower() == "admin":
        if branch_id:
            query = query.filter(ProductModel.branch_id == branch_id)
    elif current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager not assigned to a branch.")
        query = query.filter(ProductModel.branch_id == current_user.branch_id)
        # Prevent branch manager from querying other branches even if they pass branch_id
        if branch_id and branch_id != current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch managers can only list products for their own branch.")
    else: # Other roles - default to no access to list all products
        # Or, if general users should see products (e.g. from their branch if applicable), adjust here.
        # For now, let's assume only admin/BM can list products like this.
        raise HTTPException(status_code=403, detail="Not authorized to list products.")

    products = query.offset(skip).limit(limit).all()
    return products

@router.put("/{product_id}", response_model=Product)
def update_product(
    product_id: int,
    product_update: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_admin_or_branch_manager_user) # Admin or BM can update
):
    db_product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    if current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id or db_product.branch_id != current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager can only update products from their own branch.")
        # Branch manager cannot change the branch_id of a product
        if product_update.branch_id is not None and product_update.branch_id != current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager cannot change the product's branch.")
    elif current_user.role.name.lower() == "admin":
        # Admin can change branch_id, but must ensure new branch exists
        if product_update.branch_id is not None and product_update.branch_id != db_product.branch_id:
            from models.branch import Branch as BranchModel
            if not db.query(BranchModel).filter(BranchModel.id == product_update.branch_id).first():
                raise HTTPException(status_code=404, detail=f"Target branch with id {product_update.branch_id} not found.")
    else: # Should not happen
        raise HTTPException(status_code=403, detail="Not authorized.")

    update_data = product_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)

    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_admin_or_branch_manager_user) # Admin or BM can delete
):
    db_product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return None
