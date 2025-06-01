from pydantic import BaseModel, condecimal, validator
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal # For precise calculations and validation

from .supplier import Supplier as SupplierSchema
from .branch import Branch as BranchSchema
from .account import Account as AccountSchema
from .user import User as UserSchema

class SupplierPaymentBase(BaseModel):
    payment_date: date
    supplier_id: int
    branch_id: int # Should ideally match supplier's branch, validated in API
    amount_paid: condecimal(gt=Decimal('0.00'), precision=12, scale=2) # amount must be positive
    payment_method_account_id: int # This is the CR side (Cash/Bank)
    reference_number: Optional[str] = None
    notes: Optional[str] = None

class SupplierPaymentCreate(SupplierPaymentBase):
    pass

class SupplierPaymentUpdate(BaseModel): # Very restricted updates typically
    reference_number: Optional[str] = None
    notes: Optional[str] = None
    payment_date: Optional[date] = None

class SupplierPayment(SupplierPaymentBase):
    id: int
    created_by_user_id: int
    created_at: datetime
    updated_at: datetime

    supplier: Optional[SupplierSchema] = None
    branch: Optional[BranchSchema] = None
    payment_account: Optional[AccountSchema] = None
    created_by: Optional[UserSchema] = None

    class Config:
        orm_mode = True
        # from_attributes = True # Pydantic v2
        json_encoders = { Decimal: lambda v: float(v) } # Ensure Decimal is JSON serializable as float

    # Pydantic V1 workaround for Decimal if needed by client, though number should be fine
    @validator('amount_paid', pre=True, always=True)
    def ensure_amount_is_float(cls, v):
        if isinstance(v, Decimal):
            return float(v)
        return v
