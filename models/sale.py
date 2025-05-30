from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from typing import Optional, List
from database import Base
from models.user import User
from models.customer import Customer
from models.product import Product
from models.branch import Branch # Import Branch


class Sale(Base):
    __tablename__ = "sales"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    sale_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    customer_id: Mapped[Optional[int]] = mapped_column(ForeignKey("customers.id"), nullable=True)
    total_amount: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"), nullable=False) # Sales must belong to a branch

    # Relationships
    items: Mapped[List["SaleItem"]] = relationship(back_populates="sale")
    customer: Mapped[Optional["Customer"]] = relationship(back_populates="sales")
    user: Mapped["User"] = relationship(foreign_keys=[user_id]) # Assuming User model updated for Mapped
    owner: Mapped["User"] = relationship(foreign_keys=[owner_id]) # Assuming User model updated for Mapped
    branch: Mapped["Branch"] = relationship(back_populates="sales", lazy="joined")


class SaleItem(Base):
    __tablename__ = "sale_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    sale_id: Mapped[int] = mapped_column(ForeignKey("sales.id"), nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[float] = mapped_column(Float, nullable=False)
    total_price: Mapped[float] = mapped_column(Float, nullable=False)

    # Relationships
    sale: Mapped["Sale"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship(back_populates="sale_items")
