from pydantic import BaseModel
from typing import Optional

class ProductBase(BaseModel):
    name: str
    product_code: str
    category: Optional[str] = None
    description: Optional[str] = None
    purchase_price: float
    selling_price: float
    stock_quantity: int = 0
    supplier_id: Optional[int] = None
    branch_id: int

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    product_code: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    purchase_price: Optional[float] = None
    selling_price: Optional[float] = None
    stock_quantity: Optional[int] = None
    supplier_id: Optional[int] = None
    branch_id: Optional[int] = None

class Product(ProductBase):
    id: int

    class Config:
        orm_mode = True

class StockAdjustment(BaseModel):
    adjustment_quantity: int
    reason: Optional[str] = None
