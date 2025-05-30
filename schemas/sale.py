from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .product import Product as ProductSchema
from .customer import Customer as CustomerSchema
from .branch import Branch as BranchSchema # Ensure BranchSchema is imported

# Schemas for SaleItem
class SaleItemBase(BaseModel):
    product_id: int
    quantity: int
    # unit_price will be fetched from product or can be overridden
    # total_price will be calculated

class SaleItemCreate(SaleItemBase):
    unit_price: Optional[float] = None # Allow overriding price at time of sale

class SaleItem(SaleItemBase):
    id: int
    sale_id: int
    unit_price: float
    total_price: float
    product: Optional[ProductSchema] = None # Include product details

    class Config:
        orm_mode = True

# Schemas for Sale
class SaleBase(BaseModel):
    customer_id: Optional[int] = None
    # sale_date is auto-generated
    # total_amount is auto-calculated
    # branch_id will be set based on user or explicit input

class SaleCreate(SaleBase):
    items: List[SaleItemCreate]
    branch_id: int # Mandatory on creation

class Sale(SaleBase):
    id: int
    sale_date: datetime
    total_amount: float
    user_id: int
    owner_id: int
    branch_id: int
    items: List[SaleItem] = []
    customer: Optional[CustomerSchema] = None
    branch: Optional[BranchSchema] = None # Use the imported BranchSchema

    class Config:
        orm_mode = True
