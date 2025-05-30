from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.user import User as UserModel
from models.supplier import Supplier as SupplierModel
from schemas.supplier import Supplier, SupplierCreate, SupplierUpdate
from dependencies import get_current_active_user

router = APIRouter(
    prefix="/suppliers",
    tags=["suppliers"],
    dependencies=[Depends(get_current_active_user)]
)

@router.post("/", response_model=Supplier)
def create_supplier(supplier: SupplierCreate, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    db_supplier = SupplierModel(**supplier.model_dump(), owner_id=current_user.id)
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

@router.get("/{supplier_id}", response_model=Supplier)
def read_supplier(supplier_id: int, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    db_supplier = db.query(SupplierModel).filter(SupplierModel.id == supplier_id, SupplierModel.owner_id == current_user.id).first()
    if db_supplier is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return db_supplier

@router.get("/", response_model=List[Supplier])
def read_suppliers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    suppliers = db.query(SupplierModel).filter(SupplierModel.owner_id == current_user.id).offset(skip).limit(limit).all()
    return suppliers

@router.put("/{supplier_id}", response_model=Supplier)
def update_supplier(supplier_id: int, supplier: SupplierUpdate, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    db_supplier = db.query(SupplierModel).filter(SupplierModel.id == supplier_id, SupplierModel.owner_id == current_user.id).first()
    if db_supplier is None:
        raise HTTPException(status_code=404, detail="Supplier not found")

    update_data = supplier.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_supplier, key, value)

    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_supplier(supplier_id: int, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    db_supplier = db.query(SupplierModel).filter(SupplierModel.id == supplier_id, SupplierModel.owner_id == current_user.id).first()
    if db_supplier is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    db.delete(db_supplier)
    db.commit()
    return None
