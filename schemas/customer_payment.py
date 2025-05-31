from pydantic import BaseModel, condecimal, validator
from typing import Optional
from datetime import date, datetime

from .customer import Customer as CustomerSchema
from .branch import Branch as BranchSchema
from .account import Account as AccountSchema
from .user import User as UserSchema # Assuming a User schema for created_by

class CustomerPaymentBase(BaseModel):
    payment_date: date
    customer_id: int
    branch_id: int # Should ideally match customer's branch, validated in API
    amount_paid: condecimal(gt=Decimal('0.00'), precision=12, scale=2) # amount must be positive
    payment_method_account_id: int # This is the DR side (Cash/Bank)
    reference_number: Optional[str] = None
    notes: Optional[str] = None

class CustomerPaymentCreate(CustomerPaymentBase):
    pass

class CustomerPaymentUpdate(BaseModel): # Very restricted updates typically
    reference_number: Optional[str] = None
    notes: Optional[str] = None
    payment_date: Optional[date] = None # Potentially allow date correction by admin

class CustomerPayment(CustomerPaymentBase):
    id: int
    created_by_user_id: int
    created_at: datetime
    updated_at: datetime

    customer: Optional[CustomerSchema] = None # Eager loaded for display
    branch: Optional[BranchSchema] = None     # Eager loaded
    payment_account: Optional[AccountSchema] = None # Eager loaded
    created_by: Optional[UserSchema] = None   # Eager loaded

    class Config:
        orm_mode = True
        # from_attributes = True # Pydantic v2

    # Pydantic V1 workaround for Decimal
    @validator('amount_paid', pre=True, always=True)
    def ensure_amount_is_float(cls, v):
        if isinstance(v, Decimal):
            return float(v)
        return v

# Need to import Decimal for Pydantic v1 workaround
from decimal import Decimal
