from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import database
import models.user as user_model
import schemas.user as user_schema
import dependencies
from utils.security import get_password_hash # For hashing password on create/update

router = APIRouter(
    prefix="/users",
    tags=["users"],
    dependencies=[Depends(dependencies.get_current_admin_user)] # All user management routes here require admin
)

@router.post("/", response_model=user_schema.User, status_code=status.HTTP_201_CREATED)
def create_user_by_admin(user: user_schema.UserCreate, db: Session = Depends(database.get_db)):
    # Check if username or email already exists
    db_user_by_username = db.query(user_model.User).filter(user_model.User.username == user.username).first()
    if db_user_by_username:
        raise HTTPException(status_code=400, detail="Username already registered")
    db_user_by_email = db.query(user_model.User).filter(user_model.User.email == user.email).first()
    if db_user_by_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Ensure role_id and branch_id (if provided) are valid
    # (These checks would ideally be more robust, e.g., checking if Role/Branch exist)
    # Correcting model imports for Role and Branch checks
    from models.role import Role as RoleModel
    from models.branch import Branch as BranchModel
    if not db.query(RoleModel).filter(RoleModel.id == user.role_id).first():
         raise HTTPException(status_code=400, detail=f"Role with id {user.role_id} not found.")
    if user.branch_id and not db.query(BranchModel).filter(BranchModel.id == user.branch_id).first():
         raise HTTPException(status_code=400, detail=f"Branch with id {user.branch_id} not found.")

    hashed_password = get_password_hash(user.password)
    new_user = user_model.User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        role_id=user.role_id,
        branch_id=user.branch_id,
        disabled=False # Default to active, admin can disable via PUT
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/", response_model=List[user_schema.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    users = db.query(user_model.User).offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=user_schema.User)
def read_user(user_id: int, db: Session = Depends(database.get_db)):
    db_user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.put("/{user_id}", response_model=user_schema.User)
def update_user_by_admin(user_id: int, user_update: user_schema.UserUpdate, db: Session = Depends(database.get_db)):
    db_user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = user_update.model_dump(exclude_unset=True)

    if "username" in update_data and update_data["username"] != db_user.username:
        if db.query(user_model.User).filter(user_model.User.username == update_data["username"]).first():
            raise HTTPException(status_code=400, detail="Username already taken")
    if "email" in update_data and update_data["email"] != db_user.email:
        if db.query(user_model.User).filter(user_model.User.email == update_data["email"]).first():
            raise HTTPException(status_code=400, detail="Email already taken")

    # Correcting model imports for Role and Branch checks
    from models.role import Role as RoleModel
    from models.branch import Branch as BranchModel
    if "role_id" in update_data:
        if not db.query(RoleModel).filter(RoleModel.id == update_data["role_id"]).first():
            raise HTTPException(status_code=400, detail=f"Role with id {update_data['role_id']} not found.")
    if "branch_id" in update_data and update_data["branch_id"] is not None:
        if not db.query(BranchModel).filter(BranchModel.id == update_data["branch_id"]).first():
            raise HTTPException(status_code=400, detail=f"Branch with id {update_data['branch_id']} not found.")


    if "password" in update_data and update_data["password"]:
        hashed_password = get_password_hash(update_data["password"])
        setattr(db_user, "hashed_password", hashed_password)
        del update_data["password"] # Avoid setting it directly again

    for key, value in update_data.items():
        setattr(db_user, key, value)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_by_admin(user_id: int, db: Session = Depends(database.get_db), current_admin: user_model.User = Depends(dependencies.get_current_admin_user)):
    db_user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    if db_user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Admin users cannot delete themselves.")

    # Consider implications: what happens to data owned by this user?
    # For now, direct deletion.
    db.delete(db_user)
    db.commit()
    return None
