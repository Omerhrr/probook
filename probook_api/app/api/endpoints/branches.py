from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session

from app.crud import crud_branch
from app.schemas.branch_schemas import Branch, BranchCreate, BranchUpdate
from app.db.session import get_db
from app.models.models import User # Corrected import
from app.core.security import get_current_active_user

router = APIRouter()

# Helper dependency to ensure user is a superuser
def get_superuser(current_user: User = Depends(get_current_active_user)) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not enough permissions"
        )
    return current_user

@router.post("/", response_model=Branch, status_code=status.HTTP_201_CREATED)
def create_new_branch(
    branch: BranchCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_superuser) # Enforce superuser for creation
):
    db_branch = crud_branch.get_branch_by_name(db, name=branch.name)
    if db_branch:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Branch with this name already exists",
        )
    return crud_branch.create_branch(db=db, branch=branch)

@router.get("/", response_model=List[Branch])
def read_all_branches(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
    # No authentication by default for listing, adjust if needed
):
    branches = crud_branch.get_branches(db, skip=skip, limit=limit)
    return branches

@router.get("/{branch_id}", response_model=Branch)
def read_single_branch(
    branch_id: int, 
    db: Session = Depends(get_db)
    # No authentication by default for reading single, adjust if needed
):
    db_branch = crud_branch.get_branch(db, branch_id=branch_id)
    if db_branch is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
    return db_branch

@router.put("/{branch_id}", response_model=Branch)
def update_existing_branch(
    branch_id: int, 
    branch: BranchUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_superuser) # Enforce superuser for update
):
    db_branch = crud_branch.get_branch(db, branch_id=branch_id)
    if db_branch is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
    
    # Check if the new name (if provided) is already taken by another branch
    if branch.name is not None and branch.name != db_branch.name:
        existing_branch_with_new_name = crud_branch.get_branch_by_name(db, name=branch.name)
        if existing_branch_with_new_name and existing_branch_with_new_name.id != branch_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Another branch with this name already exists.",
            )
            
    return crud_branch.update_branch(db=db, branch_db_obj=db_branch, branch_in=branch)

@router.delete("/{branch_id}", response_model=Branch)
def delete_existing_branch(
    branch_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_superuser) # Enforce superuser for deletion
):
    deleted_branch = crud_branch.delete_branch(db, branch_id=branch_id)
    if deleted_branch is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
    return deleted_branch
