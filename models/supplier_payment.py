from sqlalchemy import Column, Integer, String, Date, DateTime, Float, ForeignKey, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from typing import Optional, TYPE_CHECKING, List # Added List for consistency, though direct back_populates might be single
from database import Base

if TYPE_CHECKING:
    from .supplier import Supplier
    from .branch import Branch
    from .account import Account
    from .user import User

class SupplierPayment(Base):
    __tablename__ = "supplier_payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    payment_date: Mapped[Date] = mapped_column(Date, nullable=False)

    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id"), nullable=False)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"), nullable=False)

    amount_paid: Mapped[float] = mapped_column(Numeric(precision=12, scale=2), nullable=False)

    payment_method_account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), nullable=False) # e.g., Cash, Bank account

    reference_number: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_by_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    supplier: Mapped["Supplier"] = relationship(back_populates="payments_made")
    branch: Mapped["Branch"] = relationship(back_populates="supplier_payments")
    payment_account: Mapped["Account"] = relationship(foreign_keys=[payment_method_account_id], back_populates="supplier_payments_via_account")
    created_by: Mapped["User"] = relationship(back_populates="supplier_payments_created", foreign_keys=[created_by_user_id])

    def __repr__(self):
        return f"<SupplierPayment(id={self.id}, supplier_id={self.supplier_id}, amount={self.amount_paid})>"
