from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import database
import models.branch as branch_model
import schemas.branch as branch_schema
import dependencies

router = APIRouter(
    prefix="/branches",
    tags=["branches"]
    # Specific endpoint dependencies will be applied below
)

@router.post("/", response_model=branch_schema.Branch, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(dependencies.get_current_admin_user)])
def create_branch(branch: branch_schema.BranchCreate, db: Session = Depends(database.get_db)):
    db_branch_check = db.query(branch_model.Branch).filter(branch_model.Branch.name == branch.name).first()
    if db_branch_check:
        raise HTTPException(status_code=400, detail="Branch with this name already exists")

    new_branch = branch_model.Branch(name=branch.name, address=branch.address)
    db.add(new_branch)
    db.commit()
    db.refresh(new_branch)
    return new_branch

@router.get("/", response_model=List[branch_schema.Branch],
            dependencies=[Depends(dependencies.get_current_active_user)]) # Any authenticated user can list branches
def read_branches(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    branches = db.query(branch_model.Branch).offset(skip).limit(limit).all()
    return branches

@router.get("/{branch_id}", response_model=branch_schema.Branch,
            dependencies=[Depends(dependencies.get_current_active_user)]) # Any authenticated user can get a specific branch
def read_branch(branch_id: int, db: Session = Depends(database.get_db)):
    db_branch = db.query(branch_model.Branch).filter(branch_model.Branch.id == branch_id).first()
    if db_branch is None:
        raise HTTPException(status_code=404, detail="Branch not found")
    return db_branch

@router.put("/{branch_id}", response_model=branch_schema.Branch,
            dependencies=[Depends(dependencies.get_current_admin_user)])
def update_branch(branch_id: int, branch_update: branch_schema.BranchUpdate, db: Session = Depends(database.get_db)):
    db_branch = db.query(branch_model.Branch).filter(branch_model.Branch.id == branch_id).first()
    if db_branch is None:
        raise HTTPException(status_code=404, detail="Branch not found")

    update_data = branch_update.model_dump(exclude_unset=True)

    if "name" in update_data and update_data["name"] != db_branch.name:
        existing_branch_with_name = db.query(branch_model.Branch).filter(branch_model.Branch.name == update_data["name"]).first()
        if existing_branch_with_name:
            raise HTTPException(status_code=400, detail="Another branch with this name already exists")

    for key, value in update_data.items():
        setattr(db_branch, key, value)

    db.add(db_branch)
    db.commit()
    db.refresh(db_branch)
    return db_branch

@router.delete("/{branch_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(dependencies.get_current_admin_user)])
def delete_branch(branch_id: int, db: Session = Depends(database.get_db)):
    db_branch = db.query(branch_model.Branch).filter(branch_model.Branch.id == branch_id).first()
    if db_branch is None:
        raise HTTPException(status_code=404, detail="Branch not found")

    # IMPORTANT: Add checks here to prevent deletion if branch is in use by users, products, etc.
    # This would involve checking related tables.
    # Example: if db.query(UserModel).filter(UserModel.branch_id == branch_id).first():
    # raise HTTPException(status_code=400, detail="Cannot delete branch: it is assigned to users.")
    # Similar checks for products, sales, etc.
    # For now, omitting these complex checks for simplicity.

    db.delete(db_branch)
    db.commit()
    return None
