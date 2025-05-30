from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from typing import List, Optional # Added Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query # Added Query
from sqlalchemy.orm import Session

from database import get_db
from models.user import User as UserModel
from models.customer import Customer as CustomerModel
from schemas.customer import Customer, CustomerCreate, CustomerUpdate
# Updated dependencies
from dependencies import get_current_active_user, get_current_admin_user, get_current_branch_manager_user, get_admin_or_branch_manager_user
from models.branch import Branch as BranchModel # For branch validation

router = APIRouter(
    prefix="/customers",
    tags=["customers"]
    # Dependencies will be per-route
)

@router.post("/", response_model=Customer, status_code=status.HTTP_201_CREATED)
def create_customer(
    customer_data: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_admin_or_branch_manager_user)
):
    target_branch_id = customer_data.branch_id

    if current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager not assigned to a branch.")
        if target_branch_id != current_user.branch_id:
            raise HTTPException(status_code=403, detail=f"Branch managers can only create customers for their own branch (Branch ID: {current_user.branch_id}).")
        final_branch_id = current_user.branch_id
    elif current_user.role.name.lower() == "admin":
        if not target_branch_id:
            raise HTTPException(status_code=400, detail="Admin must specify a branch_id for the customer.")
        final_branch_id = target_branch_id
    else:
        raise HTTPException(status_code=403, detail="Not authorized to create customers.")

    if not db.query(BranchModel).filter(BranchModel.id == final_branch_id).first():
        raise HTTPException(status_code=404, detail=f"Branch with id {final_branch_id} not found.")

    customer_dict = customer_data.model_dump()
    customer_dict['branch_id'] = final_branch_id

    # owner_id is still the user who performed the action (current_user.id)
    # registration_date is handled by server_default in model
    db_customer = CustomerModel(**customer_dict, owner_id=current_user.id)
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.get("/{customer_id}", response_model=Customer)
def read_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    db_customer = db.query(CustomerModel).filter(CustomerModel.id == customer_id).first()
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")

    if current_user.role.name.lower() == "admin":
        return db_customer
    elif current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id or db_customer.branch_id != current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager can only view customers from their own branch.")
        return db_customer
    else:
        raise HTTPException(status_code=403, detail="Not authorized to view this customer.")

@router.get("/", response_model=List[Customer])
def read_customers(
    branch_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    query = db.query(CustomerModel)
    if current_user.role.name.lower() == "admin":
        if branch_id:
            query = query.filter(CustomerModel.branch_id == branch_id)
    elif current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager not assigned to a branch.")
        query = query.filter(CustomerModel.branch_id == current_user.branch_id)
        if branch_id and branch_id != current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch managers can only list customers for their own branch.")
    else:
        raise HTTPException(status_code=403, detail="Not authorized to list customers.")

    customers = query.offset(skip).limit(limit).all()
    return customers

@router.put("/{customer_id}", response_model=Customer)
def update_customer(
    customer_id: int,
    customer_update_data: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_admin_or_branch_manager_user)
):
    db_customer = db.query(CustomerModel).filter(CustomerModel.id == customer_id).first()
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")

    if current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id or db_customer.branch_id != current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager can only update customers from their own branch.")
        if customer_update_data.branch_id is not None and customer_update_data.branch_id != current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager cannot change the customer's branch.")
    elif current_user.role.name.lower() == "admin":
        if customer_update_data.branch_id is not None and customer_update_data.branch_id != db_customer.branch_id:
            if not db.query(BranchModel).filter(BranchModel.id == customer_update_data.branch_id).first():
                raise HTTPException(status_code=404, detail=f"Target branch with id {customer_update_data.branch_id} not found.")
    else:
        raise HTTPException(status_code=403, detail="Not authorized.")

    update_data = customer_update_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_customer, key, value)

    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_admin_or_branch_manager_user)
):
    db_customer = db.query(CustomerModel).filter(CustomerModel.id == customer_id).first()
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(db_customer)
    db.commit()
    return None
