from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func # For server_default func.now() if needed, though expiry is usually calculated
from datetime import datetime # For type hinting and default expiry calculation
from typing import Optional

from database import Base
# Assuming User model is in models.user
from .user import User # This will be needed for the relationship

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    token: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)

    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    # To mark if the token has been used
    used_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    # Relationship to User
    user: Mapped["User"] = relationship(back_populates="password_reset_tokens")
    # Note: "User" model would need a corresponding "password_reset_tokens" relationship

    def __repr__(self):
        return f"<PasswordResetToken(user_id={self.user_id}, token='{self.token[:10]}...', expires_at='{self.expires_at}')>"
