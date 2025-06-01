from datetime import datetime, timedelta
from typing import Any, Union
import secrets
from sqlalchemy.orm import Session
from models.password_reset_token import PasswordResetToken

from jose import jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

from config import settings

SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Password Reset Token Functions

def generate_secure_reset_token(length: int = 32) -> str:
    """Generates a cryptographically secure, URL-safe string."""
    return secrets.token_urlsafe(length)

def create_password_reset_token_for_user(db: Session, user_id: int, expires_in_minutes: int = 60) -> str:
    """
    Generates a password reset token, stores its hash (or the token itself if not hashing)
    in the database, and returns the plain token.
    For simplicity, this version stores the plain token. Hashing it before storage
    adds another layer of security similar to passwords, but is more complex to manage
    for lookup. Given it's single-use and time-limited, storing plain is often acceptable.
    """
    token_value = generate_secure_reset_token()
    expires_at = datetime.utcnow() + timedelta(minutes=expires_in_minutes)

    # Invalidate any existing non-expired, non-used tokens for this user
    # to ensure only the latest token is valid.
    existing_tokens = db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user_id,
        PasswordResetToken.used_at == None, # SQLAlchemy way to check for NULL
        PasswordResetToken.expires_at > datetime.utcnow()
    ).all()
    for t in existing_tokens:
        t.expires_at = datetime.utcnow() - timedelta(seconds=1) # Expire them immediately
        db.add(t)

    db_token = PasswordResetToken(
        user_id=user_id,
        token=token_value, # Storing the plain token
        expires_at=expires_at
    )
    db.add(db_token)
    db.commit()
    # db.refresh(db_token) # Not strictly needed as we return the plain token_value

    return token_value
