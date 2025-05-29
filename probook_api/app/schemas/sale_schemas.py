from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SaleItemBase(BaseModel):
    product_id: int
    quantity_sold: int

class SaleItemCreate(SaleItemBase):
    pass

class SaleItem(SaleItemBase):
    id: int
    unit_price: float # Price at time of sale
    total_price_for_item: float

    class Config:
        orm_mode = True

class SaleBase(BaseModel):
    branch_id: int
    # user_id will be auto-filled, not part of direct input for creation by normal users

class SaleCreate(BaseModel): # user_id is not expected from client here
    branch_id: int
    items: List[SaleItemCreate]

class Sale(SaleBase): # user_id is included here as it's part of the Sale model
    id: int
    user_id: int 
    invoice_number: str
    total_amount: float
    sale_date: datetime
    items: List[SaleItem]

    class Config:
        orm_mode = True
