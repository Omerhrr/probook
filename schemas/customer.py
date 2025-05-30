from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date

class CustomerBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(CustomerBase):
    name: Optional[str] = None # Allow partial updates
    # registration_date is typically not updated

class Customer(CustomerBase):
    id: int
    owner_id: int
    registration_date: date

    class Config:
        orm_mode = True
