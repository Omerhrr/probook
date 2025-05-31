from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from typing import TYPE_CHECKING
from database import Base

if TYPE_CHECKING:
    from .branch import Branch
    from .account import Account

class AccountingSetting(Base):
    __tablename__ = "accounting_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"), nullable=False)
    key: Mapped[str] = mapped_column(String(255), nullable=False) # e.g., "default_sales_revenue_account_id"
    value_account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    branch: Mapped["Branch"] = relationship(back_populates="accounting_settings")
    account: Mapped["Account"] = relationship(back_populates="accounting_settings") # Account set as the value

    __table_args__ = (
        UniqueConstraint('branch_id', 'key', name='uq_branch_key_setting'),
    )

    def __repr__(self):
        return f"<AccountingSetting(branch_id={self.branch_id}, key='{self.key}', value_account_id={self.value_account_id})>"
