from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base # Assuming Base is defined in database.py as shown before
from models.user import User # Assuming User model is in models/user.py

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, index=True, nullable=False)
    category = Column(String, index=True)
    purchase_date = Column(Date)
    selling_price = Column(Float, nullable=False)
    purchase_price = Column(Float)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    opening_stock = Column(Integer, default=0)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User")
    supplier = relationship("Supplier", back_populates="products")
    sale_items = relationship("SaleItem", back_populates="product")
