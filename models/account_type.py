from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List
from database import Base

class AccountType(Base):
    __tablename__ = "account_types"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationship to Account model
    # Account model will have account_type_id (FK) and account_type relationship
    accounts: Mapped[List["Account"]] = relationship(back_populates="account_type")

    def __repr__(self):
        return f"<AccountType(id={self.id}, name='{self.name}')>"
