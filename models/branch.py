from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import Mapped, relationship, mapped_column # Ensure mapped_column is imported for FKs
from typing import Optional, List

from database import Base
# Forward declaration for type hinting if User model is in another file and uses Mapped
# from typing import TYPE_CHECKING
# if TYPE_CHECKING:
#     from .user import User
#     from .product import Product
#     from .account import Account
#     from .journal_entry import JournalEntry
#     from .accounting_setting import AccountingSetting
#     from .customer_payment import CustomerPayment # For type hinting

# Consolidate imports at the top
from .account import Account
from .journal_entry import JournalEntry
from .accounting_setting import AccountingSetting
from .customer_payment import CustomerPayment
# Need to import other models this Branch refers to in relationships if not already via other means
# e.g. User, Product, Supplier, Customer, Sale, Expense for Mapped[List["X"]] types.
# Assuming these are handled by string evaluation or forward references implicitly.
# For explicit type checking and clarity, they could be added to TYPE_CHECKING block.
# For now, focusing on ensuring the necessary ones for back_populates are directly imported.

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
    journal_entries: Mapped[List["JournalEntry"]] = relationship(back_populates="branch")
    accounting_settings: Mapped[List["AccountingSetting"]] = relationship(back_populates="branch")
    customer_payments: Mapped[List["CustomerPayment"]] = relationship(back_populates="branch") # Added

    def __repr__(self):
        return f"<Branch(id={self.id}, name='{self.name}')>"

# Removed imports from here as they are moved to the top

# To make Mapped["ModelName"] work correctly when models are in different files
# and to avoid circular imports, we need to handle type hinting carefully.
# Python's Postponed Evaluation of Annotations (PEP 563, default in Python 3.7+) helps.
# Explicit forward references with strings ("ModelName") are generally robust.
# If using older Python or specific setups, `if TYPE_CHECKING:` block might be needed.
# For now, assuming string forward references work with current SQLAlchemy/Python setup.
