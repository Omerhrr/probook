from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from typing import Optional
from database import Base
from models.user import User
from models.supplier import Supplier
from models.branch import Branch # Import Branch


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    expense_date: Mapped[Date] = mapped_column(Date, server_default=func.now())
    category: Mapped[str] = mapped_column(String, index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)

    supplier_id: Mapped[Optional[int]] = mapped_column(ForeignKey("suppliers.id"), nullable=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"), nullable=False) # Expenses must belong to a branch

    # Relationships
    owner: Mapped["User"] = relationship(foreign_keys=[owner_id]) # Assuming User model updated for Mapped
    supplier: Mapped[Optional["Supplier"]] = relationship(back_populates="expenses")
    branch: Mapped["Branch"] = relationship(back_populates="expenses", lazy="joined")
