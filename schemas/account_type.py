from pydantic import BaseModel
from typing import Optional

class AccountTypeBase(BaseModel):
    name: str
    description: Optional[str] = None

class AccountTypeCreate(AccountTypeBase):
    pass

class AccountTypeUpdate(AccountTypeBase):
    name: Optional[str] = None # Allow partial updates
    description: Optional[str] = None

class AccountTypeInDB(AccountTypeBase): # Using InDB suffix for clarity, can be just AccountType
    id: int

    class Config:
        orm_mode = True
        # from_attributes = True # Pydantic v2

# Alias for response model if preferred
AccountType = AccountTypeInDB
