from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import Optional, List # Added List
from database import Base
from models.user import User
# Import Branch and other related models for type hinting
from models.branch import Branch
from models.supplier import Supplier
from models.sale import SaleItem # Assuming SaleItem model is in models.sale


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String, index=True, nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String, index=True, nullable=True) # Was missing Optional
    purchase_date: Mapped[Optional[Date]] = mapped_column(Date, nullable=True) # Was missing Optional
    selling_price: Mapped[float] = mapped_column(Float, nullable=False)
    purchase_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True) # Was missing Optional

    supplier_id: Mapped[Optional[int]] = mapped_column(ForeignKey("suppliers.id"), nullable=True)
    opening_stock: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False) # Assuming owner is mandatory
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"), nullable=False) # Products must belong to a branch

    # Relationships
    # User model needs to define `products: Mapped[List["Product"]] = relationship(back_populates="owner")`
    owner: Mapped["User"] = relationship() # Let User side define back_populates to avoid circ. import issues here for now

    # Supplier model needs `products: Mapped[List["Product"]] = relationship(back_populates="supplier")`
    supplier: Mapped[Optional["Supplier"]] = relationship(back_populates="products")

    # SaleItem model needs `product: Mapped["Product"] = relationship(back_populates="sale_items")`
    sale_items: Mapped[List["SaleItem"]] = relationship(back_populates="product")

    # Branch model needs `products: Mapped[List["Product"]] = relationship(back_populates="branch")`
    branch: Mapped["Branch"] = relationship(back_populates="products", lazy="joined")
