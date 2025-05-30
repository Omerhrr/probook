from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from models.user import User # For owner_id relationship
from models.supplier import Supplier # For supplier_id relationship

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    expense_date = Column(Date, server_default=func.now())
    category = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False) # Business/branch owner

    # Relationships
    owner = relationship("User", foreign_keys=[owner_id])
    supplier = relationship("Supplier", back_populates="expenses")
