from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base # Assuming Base is defined in database.py
from models.user import User # Assuming User model is in models/user.py

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    registration_date = Column(Date, default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User")
    sales = relationship("Sale", back_populates="customer")
