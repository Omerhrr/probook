from pydantic import BaseModel, condecimal, validator
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal # For precise calculations and validation

from .product import Product as ProductSchema # For nested display in PurchaseOrderItem
from .supplier import Supplier as SupplierSchema
from .branch import Branch as BranchSchema
from .user import User as UserSchema # Assuming User schema for created_by

# Schemas for PurchaseOrderItem
class PurchaseOrderItemBase(BaseModel):
    product_id: int
    quantity: condecimal(gt=Decimal('0'), precision=10, scale=2) # Quantity must be positive
    unit_cost: condecimal(ge=Decimal('0'), precision=12, scale=2) # Unit cost can be 0, must be non-negative

    # total_cost will be calculated in the backend or can be validated if provided

class PurchaseOrderItemCreate(PurchaseOrderItemBase):
    pass

class PurchaseOrderItem(PurchaseOrderItemBase):
    id: int
    purchase_order_id: int
    total_cost: Decimal # Should be Decimal from the Numeric backend type
    product: Optional[ProductSchema] = None # Nested product details

    class Config:
        orm_mode = True
        # from_attributes = True # Pydantic v2
        json_encoders = { Decimal: lambda v: float(v) } # Ensure Decimal is JSON serializable as float

# Schemas for PurchaseOrder
class PurchaseOrderBase(BaseModel):
    order_date: date
    supplier_id: int
    branch_id: int
    status: str = "Received" # Default status
    notes: Optional[str] = None

class PurchaseOrderCreate(PurchaseOrderBase):
    items: List[PurchaseOrderItemCreate]

    @validator('items')
    def check_at_least_one_item(cls, items: List[PurchaseOrderItemCreate]):
        if not items or len(items) < 1:
            raise ValueError('A purchase order must have at least one item.')
        return items

class PurchaseOrderUpdate(BaseModel): # Define what can be updated
    order_date: Optional[date] = None
    supplier_id: Optional[int] = None
    # branch_id is typically not changed once set
    status: Optional[str] = None
    notes: Optional[str] = None
    # Updating items would be more complex (e.g., separate endpoints or specific logic)
    # For now, not allowing direct item updates via this schema.

class PurchaseOrder(PurchaseOrderBase):
    id: int
    total_amount: Decimal # Should be Decimal from Numeric backend type
    created_by_user_id: int
    created_at: datetime
    updated_at: datetime

    items: List[PurchaseOrderItem] = []
    supplier: Optional[SupplierSchema] = None
    branch: Optional[BranchSchema] = None
    created_by: Optional[UserSchema] = None

    class Config:
        orm_mode = True
        # from_attributes = True # Pydantic v2
        json_encoders = { Decimal: lambda v: float(v) }
