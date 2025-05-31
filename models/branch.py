from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import Mapped, relationship, mapped_column # Ensure mapped_column is imported for FKs
from typing import Optional, List

from database import Base
# Forward declaration for type hinting if User model is in another file and uses Mapped
# from typing import TYPE_CHECKING
# if TYPE_CHECKING:
#     from .user import User
#     from .product import Product
#     from .account import Account # Added for type hinting within this file if needed

from .account import Account # Ensure Account is imported for Mapped[List["Account"]]

class Branch(Base):
    __tablename__ = "branches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True, nullable=False)
    address: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # Relationships: One branch can have many users, products, suppliers, etc.
    users: Mapped[List["User"]] = relationship(back_populates="branch")
    products: Mapped[List["Product"]] = relationship(back_populates="branch")
    suppliers: Mapped[List["Supplier"]] = relationship(back_populates="branch")
    customers: Mapped[List["Customer"]] = relationship(back_populates="branch")
    sales: Mapped[List["Sale"]] = relationship(back_populates="branch")
    expenses: Mapped[List["Expense"]] = relationship(back_populates="branch")
    accounts: Mapped[List["Account"]] = relationship(back_populates="branch")
    journal_entries: Mapped[List["JournalEntry"]] = relationship(back_populates="branch") # Added

    def __repr__(self):
        return f"<Branch(id={self.id}, name='{self.name}')>"

# Import JournalEntry if not already present (it won't be)
from .journal_entry import JournalEntry

# Add Account to imports if not already (assuming it's in .account)
# from .account import Account

# To make Mapped["ModelName"] work correctly when models are in different files
# and to avoid circular imports, we need to handle type hinting carefully.
# Python's Postponed Evaluation of Annotations (PEP 563, default in Python 3.7+) helps.
# Explicit forward references with strings ("ModelName") are generally robust.
# If using older Python or specific setups, `if TYPE_CHECKING:` block might be needed.
# For now, assuming string forward references work with current SQLAlchemy/Python setup.
