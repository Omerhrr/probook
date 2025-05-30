from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date
from .branch import Branch as BranchSchema # Import Branch schema

class CustomerBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class CustomerCreate(CustomerBase):
    branch_id: int # Mandatory on creation

class CustomerUpdate(CustomerBase):
    name: Optional[str] = None
    # registration_date is typically not updated
    branch_id: Optional[int] = None # Allow updating branch

class Customer(CustomerBase):
    id: int
    owner_id: int
    branch_id: int
    registration_date: date
    branch: BranchSchema # Nested Branch information

    class Config:
        orm_mode = True
        # from_attributes = True # Pydantic v2
