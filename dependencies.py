from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from database import get_db
from models.user import User as UserModel
from schemas.token import TokenData
from utils.security import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> UserModel:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception

    user = db.query(UserModel).filter(UserModel.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: UserModel = Depends(get_current_user)) -> UserModel:
    if not hasattr(current_user, 'disabled'): # Check if user object is as expected
        raise HTTPException(status_code=500, detail="User model configuration error.")
    if current_user.disabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")

    # Ensure role is loaded, which it should be with lazy="joined"
    if not hasattr(current_user, 'role') or current_user.role is None:
       # This might happen if a user was created without a role, which shouldn't be allowed by UserCreate schema
       # Or if the relationship is not correctly loaded (though lazy="joined" should handle it)
       # For robustness, we can add a check, but ideally data integrity ensures role is present.
       pass # Not raising error here, but specific dependencies below will check role name.

    return current_user

# New dependency for Admin users
async def get_current_admin_user(current_active_user: UserModel = Depends(get_current_active_user)) -> UserModel:
    if not current_active_user.role or current_active_user.role.name.lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted: Requires admin privileges"
        )
    return current_active_user

# New dependency for Branch Manager users
async def get_current_branch_manager_user(current_active_user: UserModel = Depends(get_current_active_user)) -> UserModel:
    if not current_active_user.role or current_active_user.role.name.lower() != "branch_manager":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted: Requires branch manager privileges"
        )
    if not current_active_user.branch_id: # Branch managers must be assigned to a branch
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Branch manager not assigned to any branch."
        )
    return current_active_user

# Dependency that allows Admin OR Branch Manager
async def get_admin_or_branch_manager_user(current_active_user: UserModel = Depends(get_current_active_user)) -> UserModel:
    # Ensure role is loaded (should be by lazy="joined")
    if not current_active_user.role:
        raise HTTPException(status_code=500, detail="User role not loaded or not set.")

    role_name = current_active_user.role.name.lower()
    if role_name not in ["admin", "branch_manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted: Requires admin or branch manager privileges"
        )
    # For branch managers, ensure they are assigned to a branch
    if role_name == "branch_manager" and not current_active_user.branch_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Branch manager is not assigned to any branch."
        )
    return current_active_user
