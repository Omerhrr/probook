from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.user import User as UserModel
from models.customer import Customer as CustomerModel
from schemas.customer import Customer, CustomerCreate, CustomerUpdate
from dependencies import get_current_active_user

router = APIRouter(
    prefix="/customers",
    tags=["customers"],
    dependencies=[Depends(get_current_active_user)]
)

@router.post("/", response_model=Customer)
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    db_customer = CustomerModel(**customer.model_dump(), owner_id=current_user.id)
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.get("/{customer_id}", response_model=Customer)
def read_customer(customer_id: int, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    db_customer = db.query(CustomerModel).filter(CustomerModel.id == customer_id, CustomerModel.owner_id == current_user.id).first()
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return db_customer

@router.get("/", response_model=List[Customer])
def read_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    customers = db.query(CustomerModel).filter(CustomerModel.owner_id == current_user.id).offset(skip).limit(limit).all()
    return customers

@router.put("/{customer_id}", response_model=Customer)
def update_customer(customer_id: int, customer: CustomerUpdate, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    db_customer = db.query(CustomerModel).filter(CustomerModel.id == customer_id, CustomerModel.owner_id == current_user.id).first()
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")

    update_data = customer.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_customer, key, value)

    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: int, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    db_customer = db.query(CustomerModel).filter(CustomerModel.id == customer_id, CustomerModel.owner_id == current_user.id).first()
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(db_customer)
    db.commit()
    return None
