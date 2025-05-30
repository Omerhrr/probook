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

from .supplier import Supplier as SupplierSchema # Import Supplier schema

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    code: Optional[str] = None
    name: Optional[str] = None
    selling_price: Optional[float] = None

class Product(ProductBase):
    id: int
    owner_id: int
    supplier: Optional[SupplierSchema] = None # Add supplier information

    class Config:
        orm_mode = True
