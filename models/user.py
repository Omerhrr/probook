from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import Optional, List, TYPE_CHECKING
from database import Base # Assuming Base is now centralized in database.py
# Import Role and Branch for relationship typing. Ensure these files exist.
from .role import Role
from .branch import Branch

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    disabled: Mapped[bool] = mapped_column(Boolean, default=False)

    # Foreign Keys and Relationships for Role and Branch
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"))
    branch_id: Mapped[Optional[int]] = mapped_column(ForeignKey("branches.id"), nullable=True)

    role: Mapped["Role"] = relationship(back_populates="users", lazy="joined")
    branch: Mapped[Optional["Branch"]] = relationship(back_populates="users", lazy="joined")

    # Relationships to other models (as owner or user who created)
    # These would be defined in the other models with a back_populates to 'owner' or 'user'
    # E.g., in Product model: owner: Mapped["User"] = relationship(back_populates="products_owned")
    # For now, focusing on role and branch relationships here.
    # products_owned: Mapped[List["Product"]] = relationship(back_populates="owner") # Example
    # sales_made: Mapped[List["Sale"]] = relationship(foreign_keys="[Sale.user_id]", back_populates="user")
    # sales_owned: Mapped[List["Sale"]] = relationship(foreign_keys="[Sale.owner_id]", back_populates="owner")
    journal_entries_created: Mapped[List["JournalEntry"]] = relationship(back_populates="created_by", foreign_keys="[JournalEntry.created_by_user_id]")
    customer_payments_created: Mapped[List["CustomerPayment"]] = relationship(back_populates="created_by", foreign_keys="[CustomerPayment.created_by_user_id]") # Added

    # Relationship to PasswordResetToken
    if TYPE_CHECKING:
        from .password_reset_token import PasswordResetToken # Import for type hint
        password_reset_tokens: Mapped[List[PasswordResetToken]] = relationship(back_populates="user", cascade="all, delete-orphan")
    else:
        # For runtime, use string literal to avoid potential issues
        password_reset_tokens = relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', role='{self.role.name if self.role else None}')>"

# Import JournalEntry if not already present
from .journal_entry import JournalEntry
from .customer_payment import CustomerPayment # Import for relationship
