from pydantic import BaseModel, EmailStr
from typing import Optional
from .branch import Branch as BranchSchema # Import Branch schema

class SupplierBase(BaseModel):
    name: str
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class SupplierCreate(SupplierBase):
    branch_id: int # Mandatory on creation

class SupplierUpdate(SupplierBase):
    name: Optional[str] = None
    branch_id: Optional[int] = None # Allow updating branch

class Supplier(SupplierBase):
    id: int
    owner_id: int
    branch_id: int
    branch: BranchSchema # Nested Branch information

    class Config:
        orm_mode = True
        # from_attributes = True # Pydantic v2
