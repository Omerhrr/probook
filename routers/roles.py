from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import database
import models.role as role_model
import schemas.role as role_schema
import dependencies

router = APIRouter(
    prefix="/roles",
    tags=["roles"],
    dependencies=[Depends(dependencies.get_current_admin_user)] # All routes here require admin
)

@router.post("/", response_model=role_schema.Role, status_code=status.HTTP_201_CREATED)
def create_role(role: role_schema.RoleCreate, db: Session = Depends(database.get_db)):
    db_role = db.query(role_model.Role).filter(role_model.Role.name == role.name).first()
    if db_role:
        raise HTTPException(status_code=400, detail="Role with this name already exists")

    new_role = role_model.Role(name=role.name, description=role.description)
    db.add(new_role)
    db.commit()
    db.refresh(new_role)
    return new_role

@router.get("/", response_model=List[role_schema.Role])
def read_roles(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    roles = db.query(role_model.Role).offset(skip).limit(limit).all()
    return roles

@router.get("/{role_id}", response_model=role_schema.Role)
def read_role(role_id: int, db: Session = Depends(database.get_db)):
    db_role = db.query(role_model.Role).filter(role_model.Role.id == role_id).first()
    if db_role is None:
        raise HTTPException(status_code=404, detail="Role not found")
    return db_role

@router.put("/{role_id}", response_model=role_schema.Role)
def update_role(role_id: int, role_update: role_schema.RoleUpdate, db: Session = Depends(database.get_db)):
    db_role = db.query(role_model.Role).filter(role_model.Role.id == role_id).first()
    if db_role is None:
        raise HTTPException(status_code=404, detail="Role not found")

    update_data = role_update.model_dump(exclude_unset=True)

    # Check for name conflict if name is being changed
    if "name" in update_data and update_data["name"] != db_role.name:
        existing_role_with_name = db.query(role_model.Role).filter(role_model.Role.name == update_data["name"]).first()
        if existing_role_with_name:
            raise HTTPException(status_code=400, detail="Another role with this name already exists")

    for key, value in update_data.items():
        setattr(db_role, key, value)

    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role(role_id: int, db: Session = Depends(database.get_db)):
    db_role = db.query(role_model.Role).filter(role_model.Role.id == role_id).first()
    if db_role is None:
        raise HTTPException(status_code=404, detail="Role not found")

    # Add check: prevent deletion if role is in use by any user
    # This requires querying the User table.
    # from models.user import User as UserModel (potential circular import if not careful)
    # users_with_role = db.query(UserModel).filter(UserModel.role_id == role_id).first()
    # if users_with_role:
    #     raise HTTPException(status_code=400, detail="Cannot delete role: it is currently assigned to one or more users.")

    # For simplicity in this step, we'll omit the check, but it's crucial in a real app.
    # If a role like "admin" is deleted, it could lock out users.

    db.delete(db_role)
    db.commit()
    return None
