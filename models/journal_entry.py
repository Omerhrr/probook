from sqlalchemy import Column, Integer, String, Date, DateTime, Float, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from typing import Optional, List
from database import Base
from models.branch import Branch # For relationship
from models.user import User # For relationship
from models.account import Account # For relationship

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    entry_date: Mapped[Date] = mapped_column(Date, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)

    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"), nullable=False)
    created_by_user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True) # Nullable if system-generated

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    items: Mapped[List["JournalEntryItem"]] = relationship(
        "JournalEntryItem",
        back_populates="journal_entry",
        cascade="all, delete-orphan"
    )
    branch: Mapped["Branch"] = relationship(back_populates="journal_entries", lazy="joined")
    created_by: Mapped[Optional["User"]] = relationship(back_populates="journal_entries_created", lazy="joined") # User who created

    def __repr__(self):
        return f"<JournalEntry(id={self.id}, date='{self.entry_date}', branch_id={self.branch_id})>"


class JournalEntryItem(Base):
    __tablename__ = "journal_entry_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    journal_entry_id: Mapped[int] = mapped_column(ForeignKey("journal_entries.id"), nullable=False)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), nullable=False)

    # Using Numeric for precision with monetary values
    # Precision and scale can be adjusted based on requirements
    debit_amount: Mapped[float] = mapped_column(Numeric(precision=12, scale=2), default=0.0, nullable=False)
    credit_amount: Mapped[float] = mapped_column(Numeric(precision=12, scale=2), default=0.0, nullable=False)

    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # Relationships
    journal_entry: Mapped["JournalEntry"] = relationship(back_populates="items")
    account: Mapped["Account"] = relationship(back_populates="journal_entry_items", lazy="joined")

    def __repr__(self):
        return f"<JournalEntryItem(id={self.id}, account_id={self.account_id}, debit={self.debit_amount}, credit={self.credit_amount})>"
