from pydantic import BaseModel
from typing import Optional
from datetime import date
from .supplier import Supplier as SupplierSchema
from .branch import Branch as BranchSchema # Ensure BranchSchema is imported

class ExpenseBase(BaseModel):
    expense_date: Optional[date] = None
    category: str
    description: Optional[str] = None
    amount: float
    supplier_id: Optional[int] = None

class ExpenseCreate(ExpenseBase):
    branch_id: int # Mandatory on creation

class ExpenseUpdate(ExpenseBase):
    category: Optional[str] = None
    amount: Optional[float] = None
    branch_id: Optional[int] = None # Allow updating branch

class Expense(ExpenseBase):
    id: int
    owner_id: int
    branch_id: int
    expense_date: date
    supplier: Optional[SupplierSchema] = None
    branch: Optional[BranchSchema] = None # Use imported BranchSchema

    class Config:
        orm_mode = True
