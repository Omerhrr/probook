from fastapi import APIRouter, Depends, HTTPException, status, Path
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import EmailStr, BaseModel, constr
from datetime import datetime

from database import get_db
from models.user import User as UserModel
from models.password_reset_token import PasswordResetToken # Added
from schemas.user import UserCreate, User as UserSchema
from schemas.token import Token
from utils.security import (
    create_access_token,
    get_password_hash,
    verify_password,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_password_reset_token_for_user # Added
)

router = APIRouter()

@router.post("/users/", response_model=UserSchema)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(UserModel).filter(UserModel.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    db_user = UserModel(username=user.username, hashed_password=hashed_password, email=user.email, full_name=user.full_name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": user.username}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/password-recovery/{email}", status_code=status.HTTP_200_OK, tags=["Authentication"])
async def request_password_recovery(
    email: EmailStr = Path(..., description="The email address of the user requesting password recovery."),
    db: Session = Depends(get_db)
):
    user = db.query(UserModel).filter(UserModel.email == email).first()

    if user and not user.disabled: # Check if user exists and is active
        # Generate and store reset token
        reset_token = create_password_reset_token_for_user(db=db, user_id=user.id)

        # TODO: Implement actual email sending here
        # Example: send_password_reset_email(email_to=user.email, token=reset_token)
        # For now, log to console for development/testing
        print(f"Password reset requested for {user.email}. Token: {reset_token}")
        print(f"Reset link would be something like: http://localhost:3000/(pages)/reset-password?token={reset_token}")

    # Important: Always return a generic message to prevent user enumeration
    return {"message": "If an account with that email exists, instructions to reset your password have been sent."}

# Pydantic model for the reset password request payload
class ResetPasswordRequest(BaseModel):
    token: str
    new_password: constr(min_length=8)

@router.post("/reset-password/", status_code=status.HTTP_200_OK, tags=["Authentication"])
async def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    # Find the token in the database
    db_token = db.query(PasswordResetToken).filter(PasswordResetToken.token == payload.token).first()

    # Validate the token
    if not db_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token.")

    if db_token.used_at is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token has already been used.")

    if db_token.expires_at < datetime.utcnow():
        # Could also mark as used or delete expired tokens here if desired
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token has expired.")

    # Token is valid, find the user
    user = db.query(UserModel).filter(UserModel.id == db_token.user_id).first()
    if not user:
        # This should ideally not happen if DB integrity is maintained (e.g. user deleted after token issued but before use)
        # but good to check.
        # Consider how to handle this - deleting the token might be one option.
        # For now, just raise an error that implies the token is invalid.
        # db.delete(db_token) # Optional: Clean up invalid token if user is gone
        # db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token (user not found).")

    if user.disabled:
        # Do not allow password reset for disabled users
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Account is disabled.")

    # Update user's password
    user.hashed_password = get_password_hash(payload.new_password)

    # Mark token as used
    db_token.used_at = datetime.utcnow()

    db.add(user)
    db.add(db_token)
    db.commit()

    return {"message": "Password has been reset successfully."}
