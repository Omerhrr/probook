from sqlalchemy import Column, Integer, String, Date, DateTime, Float, ForeignKey, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from typing import Optional, List, TYPE_CHECKING
from database import Base

if TYPE_CHECKING:
    from .supplier import Supplier
    from .branch import Branch
    from .user import User
    from .product import Product

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    order_date: Mapped[Date] = mapped_column(Date, nullable=False)

    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id"), nullable=False)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"), nullable=False)

    total_amount: Mapped[float] = mapped_column(Numeric(precision=12, scale=2), nullable=False, default=0.0)
    status: Mapped[str] = mapped_column(String(50), default="Received", nullable=False) # e.g., Pending, Received, Cancelled

    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_by_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    supplier: Mapped["Supplier"] = relationship(back_populates="purchase_orders", lazy="joined")
    branch: Mapped["Branch"] = relationship(back_populates="purchase_orders", lazy="joined")
    created_by: Mapped["User"] = relationship(back_populates="purchase_orders_created", lazy="joined")

    items: Mapped[List["PurchaseOrderItem"]] = relationship(
        "PurchaseOrderItem",
        back_populates="purchase_order",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<PurchaseOrder(id={self.id}, supplier_id={self.supplier_id}, branch_id={self.branch_id}, total_amount={self.total_amount})>"


class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    purchase_order_id: Mapped[int] = mapped_column(ForeignKey("purchase_orders.id"), nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)

    quantity: Mapped[float] = mapped_column(Numeric(precision=10, scale=2), nullable=False) # Allow float for qty, e.g. kg
    unit_cost: Mapped[float] = mapped_column(Numeric(precision=12, scale=2), nullable=False) # Cost at time of purchase
    total_cost: Mapped[float] = mapped_column(Numeric(precision=12, scale=2), nullable=False) # quantity * unit_cost

    # Relationships
    purchase_order: Mapped["PurchaseOrder"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship(back_populates="purchase_order_items", lazy="joined")

    def __repr__(self):
        return f"<PurchaseOrderItem(id={self.id}, product_id={self.product_id}, quantity={self.quantity}, unit_cost={self.unit_cost})>"
