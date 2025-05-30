from pydantic import BaseModel, EmailStr
from typing import Optional

class SupplierBase(BaseModel):
    name: str
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(SupplierBase):
    name: Optional[str] = None # Allow partial updates

class Supplier(SupplierBase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True
