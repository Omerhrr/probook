from pydantic import BaseModel
from typing import Optional
from datetime import datetime # For response model

from .branch import Branch as BranchSchema # For nested display
from .account import Account as AccountSchema # For nested display

class AccountingSettingBase(BaseModel):
    key: str
    value_account_id: int
    branch_id: int # Must be specified during creation/update

class AccountingSettingCreate(AccountingSettingBase):
    pass

class AccountingSettingUpdate(BaseModel): # Allow partial updates, but key/branch usually fixed
    value_account_id: Optional[int] = None

class AccountingSetting(AccountingSettingBase):
    id: int
    created_at: datetime
    updated_at: datetime
    branch: Optional[BranchSchema] = None # Include for context
    account: Optional[AccountSchema] = None # The account referenced by value_account_id

    class Config:
        orm_mode = True
        # from_attributes = True # Pydantic v2
