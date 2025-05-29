from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session

from app.crud import crud_supplier, crud_branch
from app.schemas.supplier_schemas import Supplier, SupplierCreate, SupplierUpdate
from app.db.session import get_db
from app.models.models import User
from app.core.security import get_current_active_user

router = APIRouter()

@router.post("/", response_model=Supplier, status_code=status.HTTP_201_CREATED)
def create_new_supplier(
    supplier: SupplierCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    # Validate branch_id using crud_branch
    branch = crud_branch.get_branch(db, branch_id=supplier.branch_id)
    if not branch:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid branch ID: {supplier.branch_id}. Branch does not exist.",
        )
    
    # In crud_supplier.create_supplier, we already handle the case where branch might be None
    # but it's good practice to check here as well, or rely on the crud layer to return None
    # and then raise the appropriate HTTP exception here.
    # For this implementation, crud_supplier.create_supplier will return None if branch is invalid.

    created_supplier = crud_supplier.create_supplier(db=db, supplier=supplier)
    # crud_supplier.create_supplier returns None if branch validation failed there.
    if created_supplier is None:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, # Should ideally not be reached if checked above
            detail="Failed to create supplier, possibly due to invalid branch ID.",
        )
    return created_supplier

@router.get("/", response_model=List[Supplier])
def read_all_suppliers(
    branch_id: Optional[int] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user) # Added authentication
):
    if branch_id is not None:
        # Validate if branch_id is a valid branch
        branch = crud_branch.get_branch(db, branch_id=branch_id)
        if not branch:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Branch with ID {branch_id} not found.",
            )
        suppliers = crud_supplier.get_suppliers_by_branch(db, branch_id=branch_id, skip=skip, limit=limit)
    else:
        suppliers = crud_supplier.get_suppliers(db, skip=skip, limit=limit)
    return suppliers

@router.get("/{supplier_id}", response_model=Supplier)
def read_single_supplier(
    supplier_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user) # Added authentication
):
    db_supplier = crud_supplier.get_supplier(db, supplier_id=supplier_id)
    if db_supplier is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")
    return db_supplier

@router.put("/{supplier_id}", response_model=Supplier)
def update_existing_supplier(
    supplier_id: int, 
    supplier: SupplierUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user) # Added authentication
):
    db_supplier = crud_supplier.get_supplier(db, supplier_id=supplier_id)
    if db_supplier is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")

    # The validation for branch_id (if provided in supplier_in) is handled within crud_supplier.update_supplier
    # which returns None if the branch_id is invalid.
    updated_supplier = crud_supplier.update_supplier(db=db, supplier_db_obj=db_supplier, supplier_in=supplier)
    
    if updated_supplier is None:
        # This case implies that branch_id was provided in the update and was invalid.
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid new branch ID provided for update.",
        )
    return updated_supplier

@router.delete("/{supplier_id}", response_model=Supplier)
def delete_existing_supplier(
    supplier_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user) # Added authentication
):
    deleted_supplier = crud_supplier.delete_supplier(db, supplier_id=supplier_id)
    if deleted_supplier is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")
    return deleted_supplier
