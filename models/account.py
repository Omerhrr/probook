from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship, backref
from typing import Optional, List
from database import Base
from .account_type import AccountType
from .branch import Branch
from .journal_entry import JournalEntryItem # Ensure JournalEntryItem is imported

class Account(Base):
    __tablename__ = "accounts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False) # Uniqueness might be per branch + name
    account_code: Mapped[Optional[str]] = mapped_column(String, nullable=True) # Uniqueness per branch + code
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    account_type_id: Mapped[int] = mapped_column(ForeignKey("account_types.id"), nullable=False)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"), nullable=False) # Non-nullable for now

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    parent_account_id: Mapped[Optional[int]] = mapped_column(ForeignKey("accounts.id"), nullable=True)

    # Relationships
    account_type: Mapped["AccountType"] = relationship(back_populates="accounts", lazy="joined")
    branch: Mapped["Branch"] = relationship(lazy="joined") # Branch model needs `accounts` relationship

    # Self-referential relationship for parent-child hierarchy
    # Using backref to create 'parent' attribute on child automatically
    children: Mapped[List["Account"]] = relationship(
        "Account",
        backref=backref('parent', remote_side=[id]), # 'parent' will be the attribute on the child side
        lazy="select", # Or "joined" if frequently accessed, "select" for on-demand
        join_depth=2 # Example: adjust as needed for performance with deep hierarchies
    )

    # TODO: Add unique constraints for (name, branch_id) and (account_code, branch_id) in __table_args__
    # from sqlalchemy import UniqueConstraint
    # __table_args__ = (
    #     UniqueConstraint('name', 'branch_id', name='uq_account_name_branch'),
    #     UniqueConstraint('account_code', 'branch_id', name='uq_account_code_branch'),
    # )

    journal_entry_items: Mapped[List["JournalEntryItem"]] = relationship(back_populates="account") # Added

    def __repr__(self):
        return f"<Account(id={self.id}, name='{self.name}', code='{self.account_code}', branch_id={self.branch_id})>"
