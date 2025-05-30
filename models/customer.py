from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from typing import Optional, List
from database import Base
from models.user import User
from models.branch import Branch # Import Branch
from models.sale import Sale # Assuming Sale model exists

class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True, nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String, unique=True, index=True, nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    address: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    registration_date: Mapped[Date] = mapped_column(Date, server_default=func.now()) # server_default for new records

    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False) # Assuming owner is mandatory
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"), nullable=False) # Customers must belong to a branch

    # Relationships
    owner: Mapped["User"] = relationship() # User model needs to define `customers_owned` or similar
    branch: Mapped["Branch"] = relationship(back_populates="customers", lazy="joined")
    sales: Mapped[List["Sale"]] = relationship(back_populates="customer")
