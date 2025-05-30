from pydantic import BaseModel
from typing import Optional

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class RoleCreate(RoleBase):
    pass

class RoleUpdate(RoleBase):
    name: Optional[str] = None # Allow partial updates on name if needed, though role names are often fixed
    description: Optional[str] = None

class Role(RoleBase):
    id: int

    class Config:
        orm_mode = True # For compatibility with SQLAlchemy models / from_attributes=True in Pydantic v2
        # from_attributes = True # Pydantic v2 style for orm_mode
