from sqlalchemy import Column, Integer, String, Date, DateTime, Float, ForeignKey, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from typing import Optional, TYPE_CHECKING
from database import Base

if TYPE_CHECKING:
    from .customer import Customer
    from .branch import Branch
    from .account import Account
    from .user import User

class CustomerPayment(Base):
    __tablename__ = "customer_payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    payment_date: Mapped[Date] = mapped_column(Date, nullable=False)

    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"), nullable=False)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"), nullable=False)

    amount_paid: Mapped[float] = mapped_column(Numeric(precision=12, scale=2), nullable=False)

    payment_method_account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), nullable=False) # e.g., Cash, Bank account

    reference_number: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_by_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    customer: Mapped["Customer"] = relationship(back_populates="payments_received")
    branch: Mapped["Branch"] = relationship(back_populates="customer_payments")
    payment_account: Mapped["Account"] = relationship(foreign_keys=[payment_method_account_id], back_populates="customer_payments_via_account")
    created_by: Mapped["User"] = relationship(back_populates="customer_payments_created", foreign_keys=[created_by_user_id])

    def __repr__(self):
        return f"<CustomerPayment(id={self.id}, customer_id={self.customer_id}, amount={self.amount_paid})>"
