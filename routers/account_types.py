from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import database
import models.account_type as account_type_model
import schemas.account_type as account_type_schema
import dependencies # For admin dependency

router = APIRouter(
    prefix="/account-types",
    tags=["Account Types"],
    dependencies=[Depends(dependencies.get_current_admin_user)] # All routes here require admin
)

@router.post("/", response_model=account_type_schema.AccountType, status_code=status.HTTP_201_CREATED)
def create_account_type(
    account_type: account_type_schema.AccountTypeCreate,
    db: Session = Depends(database.get_db)
):
    db_account_type = db.query(account_type_model.AccountType).filter(account_type_model.AccountType.name == account_type.name).first()
    if db_account_type:
        raise HTTPException(status_code=400, detail="Account type with this name already exists")

    new_account_type = account_type_model.AccountType(**account_type.model_dump())
    db.add(new_account_type)
    db.commit()
    db.refresh(new_account_type)
    return new_account_type

@router.get("/", response_model=List[account_type_schema.AccountType])
def read_account_types(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db)
):
    account_types = db.query(account_type_model.AccountType).offset(skip).limit(limit).all()
    return account_types

@router.get("/{account_type_id}", response_model=account_type_schema.AccountType)
def read_account_type(
    account_type_id: int,
    db: Session = Depends(database.get_db)
):
    db_account_type = db.query(account_type_model.AccountType).filter(account_type_model.AccountType.id == account_type_id).first()
    if db_account_type is None:
        raise HTTPException(status_code=404, detail="Account type not found")
    return db_account_type

@router.put("/{account_type_id}", response_model=account_type_schema.AccountType)
def update_account_type(
    account_type_id: int,
    account_type_update: account_type_schema.AccountTypeUpdate,
    db: Session = Depends(database.get_db)
):
    db_account_type = db.query(account_type_model.AccountType).filter(account_type_model.AccountType.id == account_type_id).first()
    if db_account_type is None:
        raise HTTPException(status_code=404, detail="Account type not found")

    update_data = account_type_update.model_dump(exclude_unset=True)

    if "name" in update_data and update_data["name"] != db_account_type.name:
        existing_type_with_name = db.query(account_type_model.AccountType).filter(account_type_model.AccountType.name == update_data["name"]).first()
        if existing_type_with_name:
            raise HTTPException(status_code=400, detail="Another account type with this name already exists")

    for key, value in update_data.items():
        setattr(db_account_type, key, value)

    db.add(db_account_type)
    db.commit()
    db.refresh(db_account_type)
    return db_account_type

@router.delete("/{account_type_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_account_type(
    account_type_id: int,
    db: Session = Depends(database.get_db)
):
    db_account_type = db.query(account_type_model.AccountType).filter(account_type_model.AccountType.id == account_type_id).first()
    if db_account_type is None:
        raise HTTPException(status_code=404, detail="Account type not found")

    # Check if any Account uses this AccountType
    if db_account_type.accounts: # Check if the relationship list is not empty
        raise HTTPException(
            status_code=400,
            detail="Cannot delete account type: it is currently in use by one or more accounts."
        )

    db.delete(db_account_type)
    db.commit()
    return None
