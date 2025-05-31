from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import date, datetime # Ensure datetime is imported for response schemas
from .account import Account as AccountSchema # For nested display in JournalEntryItem
from .branch import Branch as BranchSchema # For nested display in JournalEntry
from .user import User as UserSchema # For nested display of created_by user

# Schemas for JournalEntryItem
class JournalEntryItemBase(BaseModel):
    account_id: int
    debit_amount: float = 0.0
    credit_amount: float = 0.0
    description: Optional[str] = None

    @validator('debit_amount', 'credit_amount', pre=True, always=True)
    def check_amounts_non_negative(cls, v):
        if v < 0:
            raise ValueError('Debit and credit amounts must be non-negative.')
        return v

    @validator('credit_amount')
    def check_debit_xor_credit(cls, credit_value, values):
        debit_value = values.get('debit_amount', 0.0)
        if debit_value > 0 and credit_value > 0:
            raise ValueError('An item cannot have both debit and credit amounts.')
        # Can also add check: if not (debit_value > 0 or credit_value > 0): raise ValueError('Either debit or credit must be provided.')
        # However, allowing zero entries might be valid for some systems if description is key.
        # For typical accounting, one must be non-zero. Let's enforce that for now.
        if debit_value == 0 and credit_value == 0:
             raise ValueError('Either debit or credit amount must be non-zero for a journal item.')
        return credit_value


class JournalEntryItemCreate(JournalEntryItemBase):
    pass

class JournalEntryItem(JournalEntryItemBase):
    id: int
    account: AccountSchema # Nested account details

    class Config:
        orm_mode = True
        # from_attributes = True # Pydantic v2

# Schemas for JournalEntry
class JournalEntryBase(BaseModel):
    entry_date: date
    description: str
    branch_id: int

class JournalEntryCreate(JournalEntryBase):
    items: List[JournalEntryItemCreate]

    @validator('items')
    def check_debits_equal_credits(cls, items: List[JournalEntryItemCreate]):
        total_debits = sum(item.debit_amount for item in items)
        total_credits = sum(item.credit_amount for item in items)
        if round(total_debits, 2) != round(total_credits, 2): # Using round for float comparison
            raise ValueError('Total debit amounts must equal total credit amounts for the journal entry.')
        if not items or len(items) < 2: # Typically a journal entry has at least two lines
            raise ValueError('A journal entry must have at least two items (lines).')
        return items

class JournalEntry(JournalEntryBase):
    id: int
    created_by_user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    items: List[JournalEntryItem] = []
    branch: BranchSchema # Nested branch details
    created_by: Optional[UserSchema] = None # Nested user details

    class Config:
        orm_mode = True
        # from_attributes = True # Pydantic v2
