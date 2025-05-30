from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from typing import List, Optional # Added Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query # Added Query
from sqlalchemy.orm import Session

from database import get_db
from models.user import User as UserModel
from models.supplier import Supplier as SupplierModel
from schemas.supplier import Supplier, SupplierCreate, SupplierUpdate
# Updated dependencies
from dependencies import get_current_active_user, get_current_admin_user, get_current_branch_manager_user, get_admin_or_branch_manager_user
from models.branch import Branch as BranchModel # For branch validation

router = APIRouter(
    prefix="/suppliers",
    tags=["suppliers"]
    # Dependencies will be per-route
)

@router.post("/", response_model=Supplier, status_code=status.HTTP_201_CREATED)
def create_supplier(
    supplier_data: SupplierCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_admin_or_branch_manager_user)
):
    target_branch_id = supplier_data.branch_id

    if current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager not assigned to a branch.")
        if target_branch_id != current_user.branch_id:
            raise HTTPException(status_code=403, detail=f"Branch managers can only create suppliers for their own branch (Branch ID: {current_user.branch_id}).")
        final_branch_id = current_user.branch_id
    elif current_user.role.name.lower() == "admin":
        if not target_branch_id:
            raise HTTPException(status_code=400, detail="Admin must specify a branch_id for the supplier.")
        final_branch_id = target_branch_id
    else:
        raise HTTPException(status_code=403, detail="Not authorized to create suppliers.")

    if not db.query(BranchModel).filter(BranchModel.id == final_branch_id).first():
        raise HTTPException(status_code=404, detail=f"Branch with id {final_branch_id} not found.")

    supplier_dict = supplier_data.model_dump()
    supplier_dict['branch_id'] = final_branch_id

    db_supplier = SupplierModel(**supplier_dict, owner_id=current_user.id)
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

@router.get("/{supplier_id}", response_model=Supplier)
def read_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    db_supplier = db.query(SupplierModel).filter(SupplierModel.id == supplier_id).first()
    if db_supplier is None:
        raise HTTPException(status_code=404, detail="Supplier not found")

    if current_user.role.name.lower() == "admin":
        return db_supplier
    elif current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id or db_supplier.branch_id != current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager can only view suppliers from their own branch.")
        return db_supplier
    else:
        # Basic users might not be allowed to see supplier details directly,
        # or only if related to their transactions (not implemented here)
        raise HTTPException(status_code=403, detail="Not authorized to view this supplier.")

@router.get("/", response_model=List[Supplier])
def read_suppliers(
    branch_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    query = db.query(SupplierModel)
    if current_user.role.name.lower() == "admin":
        if branch_id:
            query = query.filter(SupplierModel.branch_id == branch_id)
    elif current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager not assigned to a branch.")
        query = query.filter(SupplierModel.branch_id == current_user.branch_id)
        if branch_id and branch_id != current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch managers can only list suppliers for their own branch.")
    else:
        # General users typically don't list all suppliers.
        # If they need to see suppliers related to their branch for some reason, logic could be added.
        raise HTTPException(status_code=403, detail="Not authorized to list suppliers.")

    suppliers = query.offset(skip).limit(limit).all()
    return suppliers

@router.put("/{supplier_id}", response_model=Supplier)
def update_supplier(
    supplier_id: int,
    supplier_update_data: SupplierUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_admin_or_branch_manager_user)
):
    db_supplier = db.query(SupplierModel).filter(SupplierModel.id == supplier_id).first()
    if db_supplier is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    if db_supplier is None:
        raise HTTPException(status_code=404, detail="Supplier not found")

    if current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id or db_supplier.branch_id != current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager can only update suppliers from their own branch.")
        if supplier_update_data.branch_id is not None and supplier_update_data.branch_id != current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager cannot change the supplier's branch.")
    elif current_user.role.name.lower() == "admin":
        if supplier_update_data.branch_id is not None and supplier_update_data.branch_id != db_supplier.branch_id:
            if not db.query(BranchModel).filter(BranchModel.id == supplier_update_data.branch_id).first():
                raise HTTPException(status_code=404, detail=f"Target branch with id {supplier_update_data.branch_id} not found.")
    else:
        raise HTTPException(status_code=403, detail="Not authorized.")

    update_data = supplier_update_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_supplier, key, value)

    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_admin_or_branch_manager_user)
):
    db_supplier = db.query(SupplierModel).filter(SupplierModel.id == supplier_id).first()
    if db_supplier is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    db.delete(db_supplier)
    db.commit()
    return None
