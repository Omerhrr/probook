from pydantic import BaseModel, EmailStr
from typing import Optional
from .role import Role as RoleSchema # Import Role schema
from .branch import Branch as BranchSchema # Import Branch schema

class UserBase(BaseModel):
    username: str
    email: EmailStr # Use EmailStr for validation
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role_id: int # Role must be assigned on creation
    branch_id: Optional[int] = None # Branch can be optional

class UserUpdate(BaseModel): # Separate update schema for flexibility
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None
    role_id: Optional[int] = None
    branch_id: Optional[int] = None
    password: Optional[str] = None # For password changes

class User(UserBase):
    id: int
    disabled: bool
    role: RoleSchema # Nested Role information
    branch: Optional[BranchSchema] = None # Nested Branch information, optional

    class Config:
        orm_mode = True
        # from_attributes = True # Pydantic v2
