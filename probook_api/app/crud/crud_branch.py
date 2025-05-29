from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.models import Branch as BranchModel
from app.schemas.branch_schemas import BranchCreate, BranchUpdate

def create_branch(db: Session, branch: BranchCreate) -> BranchModel:
    db_branch = BranchModel(name=branch.name, location=branch.location)
    db.add(db_branch)
    db.commit()
    db.refresh(db_branch)
    return db_branch

def get_branch(db: Session, branch_id: int) -> Optional[BranchModel]:
    return db.query(BranchModel).filter(BranchModel.id == branch_id).first()

def get_branches(db: Session, skip: int = 0, limit: int = 100) -> List[BranchModel]:
    return db.query(BranchModel).offset(skip).limit(limit).all()

def get_branch_by_name(db: Session, name: str) -> Optional[BranchModel]:
    return db.query(BranchModel).filter(BranchModel.name == name).first()

def update_branch(db: Session, branch_db_obj: BranchModel, branch_in: BranchUpdate) -> BranchModel:
    if branch_in.name is not None:
        branch_db_obj.name = branch_in.name
    if branch_in.location is not None:
        branch_db_obj.location = branch_in.location
    
    db.add(branch_db_obj) # Add to session, even if it's already there, to ensure it's tracked for commit
    db.commit()
    db.refresh(branch_db_obj)
    return branch_db_obj

def delete_branch(db: Session, branch_id: int) -> Optional[BranchModel]:
    db_branch = db.query(BranchModel).filter(BranchModel.id == branch_id).first()
    if db_branch:
        db.delete(db_branch)
        db.commit()
        return db_branch
    return None
