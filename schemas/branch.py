from pydantic import BaseModel
from typing import Optional

class BranchBase(BaseModel):
    name: str
    address: Optional[str] = None

class BranchCreate(BranchBase):
    pass

class BranchUpdate(BranchBase):
    name: Optional[str] = None # Allow partial updates
    address: Optional[str] = None

class Branch(BranchBase):
    id: int

    class Config:
        orm_mode = True
        # from_attributes = True # Pydantic v2 style
