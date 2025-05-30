from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import Mapped, relationship # Using Mapped for newer SQLAlchemy syntax if consistent
from database import Base

class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    name: Mapped[str] = Column(String, unique=True, index=True, nullable=False)
    description: Mapped[str] = Column(String, nullable=True) # Optional description

    # If users are directly related from role (though usually User has role_id)
    # users: Mapped[list["User"]] = relationship(back_populates="role") # Example, if User model has a 'role' relationship

    # For SQLAlchemy < 2.0 style, it would be:
    # id = Column(Integer, primary_key=True, index=True)
    # name = Column(String, unique=True, index=True, nullable=False)
    # description = Column(String, nullable=True)
    # users = relationship("User", back_populates="role") # If User model exists and has this relationship

    # Sticking to the SQLAlchemy 2.0 Mapped style for consistency with potential future model updates.
    # If existing models use the older style, this might need adjustment or a mix.
    # For now, assuming we're moving towards Mapped style.
    # If `User` model is not yet updated to use `Mapped`, the relationship might need to be defined differently
    # or commented out until `User` is updated.
    # Given the task asks to modify User model with Mapped, this is fine.
    users = relationship("User", back_populates="role") # This defines the "many" side from Role's perspective.
                                                        # User model will have the "one" side (role_id and role relationship)

    def __repr__(self):
        return f"<Role(id={self.id}, name='{self.name}')>"
