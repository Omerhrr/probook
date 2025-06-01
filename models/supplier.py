from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import Optional, List
from database import Base
from models.user import User
from models.branch import Branch
from models.product import Product
from models.expense import Expense
from .purchase_order import PurchaseOrder
from .supplier_payment import SupplierPayment # Ensure SupplierPayment is imported

class Supplier(Base):
    __tablename__ = "suppliers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True, nullable=False)
    contact_person: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String, unique=True, index=True, nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    address: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False) # Assuming owner is mandatory
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"), nullable=False) # Suppliers must belong to a branch

    # Relationships
    owner: Mapped["User"] = relationship() # User model needs to define `suppliers_owned` or similar
    branch: Mapped["Branch"] = relationship(back_populates="suppliers", lazy="joined")

    products: Mapped[List["Product"]] = relationship(back_populates="supplier")
    expenses: Mapped[List["Expense"]] = relationship(back_populates="supplier")
    purchase_orders: Mapped[List["PurchaseOrder"]] = relationship(back_populates="supplier")
    payments_made: Mapped[List["SupplierPayment"]] = relationship(back_populates="supplier") # Added
