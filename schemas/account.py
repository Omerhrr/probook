from pydantic import BaseModel
from typing import Optional, List
from .account_type import AccountType as AccountTypeSchema # For nested display
from .branch import Branch as BranchSchema # For nested display

class AccountBase(BaseModel):
    name: str
    account_code: Optional[str] = None
    description: Optional[str] = None
    account_type_id: int
    branch_id: int
    is_active: bool = True
    parent_account_id: Optional[int] = None

class AccountCreate(AccountBase):
    pass

class AccountUpdate(BaseModel): # More flexible updates
    name: Optional[str] = None
    account_code: Optional[str] = None
    description: Optional[str] = None
    account_type_id: Optional[int] = None
    branch_id: Optional[int] = None # Usually not changed, but admin might
    is_active: Optional[bool] = None
    parent_account_id: Optional[int] = None # Allow reparenting or clearing parent

# For responses, including nested data
class Account(AccountBase):
    id: int
    account_type: AccountTypeSchema
    branch: BranchSchema
    # children: List["Account"] = [] # Recursive schema for children, can be complex

    class Config:
        orm_mode = True
        # from_attributes = True # Pydantic v2

# To handle recursive children if needed:
class AccountWithChildren(Account):
    children: List["AccountWithChildren"] = []

# Account.model_rebuild() # Pydantic v2
# AccountWithChildren.model_rebuild() # Pydantic v2
# For Pydantic v1, a common workaround is:
# AccountWithChildren.update_forward_refs()

# For now, the main 'Account' schema will not include children to avoid complexity
# until explicitly needed for an API response.
# The relationship is in the model for SQLAlchemy ORM use.
