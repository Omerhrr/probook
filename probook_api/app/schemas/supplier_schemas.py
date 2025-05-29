from pydantic import BaseModel
from typing import Optional

class SupplierBase(BaseModel):
    name: str
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    branch_id: int

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(BaseModel): # Modified to allow all fields to be optional
    name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    branch_id: Optional[int] = None

class Supplier(SupplierBase):
    id: int

    class Config:
        orm_mode = True
