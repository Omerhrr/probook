from pydantic import BaseModel
from typing import Optional

class BranchBase(BaseModel):
    name: str
    location: Optional[str] = None

class BranchCreate(BranchBase):
    pass

class BranchUpdate(BranchBase):
    name: Optional[str] = None
    location: Optional[str] = None

class Branch(BranchBase):
    id: int

    class Config:
        orm_mode = True
