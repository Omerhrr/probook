from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.models import Supplier as SupplierModel
from app.models.models import Branch as BranchModel # For validation
from app.schemas.supplier_schemas import SupplierCreate, SupplierUpdate
from app.crud import crud_branch # To check if branch exists

def create_supplier(db: Session, supplier: SupplierCreate) -> Optional[SupplierModel]:
    # Validate if supplier.branch_id corresponds to an existing branch
    branch = crud_branch.get_branch(db, branch_id=supplier.branch_id)
    if not branch:
        # Returning None, API layer will handle HTTPException
        return None 
    
    db_supplier = SupplierModel(
        name=supplier.name,
        contact_person=supplier.contact_person,
        email=supplier.email,
        phone=supplier.phone,
        branch_id=supplier.branch_id,
    )
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

def get_supplier(db: Session, supplier_id: int) -> Optional[SupplierModel]:
    return db.query(SupplierModel).filter(SupplierModel.id == supplier_id).first()

def get_suppliers(db: Session, skip: int = 0, limit: int = 100) -> List[SupplierModel]:
    return db.query(SupplierModel).offset(skip).limit(limit).all()

def get_suppliers_by_branch(db: Session, branch_id: int, skip: int = 0, limit: int = 100) -> List[SupplierModel]:
    return db.query(SupplierModel).filter(SupplierModel.branch_id == branch_id).offset(skip).limit(limit).all()

def update_supplier(db: Session, supplier_db_obj: SupplierModel, supplier_in: SupplierUpdate) -> Optional[SupplierModel]:
    update_data = supplier_in.model_dump(exclude_unset=True)

    if "branch_id" in update_data and update_data["branch_id"] is not None:
        # Validate the new branch_id
        branch = crud_branch.get_branch(db, branch_id=update_data["branch_id"])
        if not branch:
            # Returning None, API layer will handle HTTPException
            return None
    
    for field, value in update_data.items():
        setattr(supplier_db_obj, field, value)
    
    db.add(supplier_db_obj)
    db.commit()
    db.refresh(supplier_db_obj)
    return supplier_db_obj

def delete_supplier(db: Session, supplier_id: int) -> Optional[SupplierModel]:
    db_supplier = db.query(SupplierModel).filter(SupplierModel.id == supplier_id).first()
    if db_supplier:
        db.delete(db_supplier)
        db.commit()
        return db_supplier
    return None
