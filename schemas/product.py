from pydantic import BaseModel
from datetime import date
from typing import Optional

class ProductBase(BaseModel):
    code: str
    name: str
    category: Optional[str] = None
    purchase_date: Optional[date] = None
    selling_price: float
    purchase_price: Optional[float] = None
    supplier_id: Optional[int] = None
    opening_stock: Optional[int] = 0

from .supplier import Supplier as SupplierSchema
from .branch import Branch as BranchSchema # Import Branch schema

class ProductCreate(ProductBase):
    # Assuming branch_id will be set based on user's branch or explicitly provided
    # For now, let's make it mandatory in create, can be adjusted based on app logic
    branch_id: int

class ProductUpdate(ProductBase):
    code: Optional[str] = None
    name: Optional[str] = None
    selling_price: Optional[float] = None
    branch_id: Optional[int] = None # Allow updating branch_id if necessary

class Product(ProductBase):
    id: int
    owner_id: int
    branch_id: int # Add branch_id
    supplier: Optional[SupplierSchema] = None
    branch: BranchSchema # Add nested Branch information

    class Config:
        orm_mode = True
        # from_attributes = True # Pydantic v2
