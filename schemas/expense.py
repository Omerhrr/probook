from pydantic import BaseModel
from typing import Optional
from datetime import date
from .supplier import Supplier as SupplierSchema # For displaying supplier details

class ExpenseBase(BaseModel):
    expense_date: Optional[date] = None # Will default to now in DB if not provided
    category: str
    description: Optional[str] = None
    amount: float
    supplier_id: Optional[int] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(ExpenseBase):
    category: Optional[str] = None # Allow partial updates
    amount: Optional[float] = None

class Expense(ExpenseBase):
    id: int
    owner_id: int
    expense_date: date # Ensure this is present in the response
    supplier: Optional[SupplierSchema] = None # Include supplier details if available

    class Config:
        orm_mode = True
