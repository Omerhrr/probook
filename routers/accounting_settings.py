from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, selectinload
from typing import List, Optional

import database
import models.accounting_setting as setting_model
import schemas.accounting_setting as setting_schema
import dependencies # For admin dependency
from models.branch import Branch as BranchModel
from models.account import Account as AccountModel

router = APIRouter(
    prefix="/accounting-settings",
    tags=["Accounting Settings"],
    dependencies=[Depends(dependencies.get_current_admin_user)]
)

@router.post("/", response_model=setting_schema.AccountingSetting, status_code=status.HTTP_201_CREATED)
def create_or_update_accounting_setting(
    setting_data: setting_schema.AccountingSettingCreate,
    db: Session = Depends(database.get_db)
):
    # Validate branch_id
    if not db.query(BranchModel).filter(BranchModel.id == setting_data.branch_id).first():
        raise HTTPException(status_code=404, detail=f"Branch with id {setting_data.branch_id} not found.")

    # Validate value_account_id
    account = db.query(AccountModel).filter(AccountModel.id == setting_data.value_account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail=f"Account with id {setting_data.value_account_id} not found.")
    if account.branch_id != setting_data.branch_id:
        raise HTTPException(status_code=400, detail=f"Account (ID: {account.id}) must belong to the specified branch (ID: {setting_data.branch_id}).")

    # Upsert logic: Check if setting for this branch_id and key already exists
    db_setting = db.query(setting_model.AccountingSetting).filter(
        setting_model.AccountingSetting.branch_id == setting_data.branch_id,
        setting_model.AccountingSetting.key == setting_data.key
    ).first()

    if db_setting: # Update if exists
        db_setting.value_account_id = setting_data.value_account_id
        # Potentially update other fields if AccountingSettingUpdate allows more
    else: # Create new if not exists
        db_setting = setting_model.AccountingSetting(**setting_data.model_dump())
        db.add(db_setting)

    db.commit()
    db.refresh(db_setting)

    # Eager load relationships for response
    return db.query(setting_model.AccountingSetting).options(
        selectinload(setting_model.AccountingSetting.branch),
        selectinload(setting_model.AccountingSetting.account)
    ).filter(setting_model.AccountingSetting.id == db_setting.id).first()


@router.get("/", response_model=List[setting_schema.AccountingSetting])
def read_accounting_settings(
    branch_id: Optional[int] = Query(None),
    key: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(database.get_db)
):
    query = db.query(setting_model.AccountingSetting).options(
        selectinload(setting_model.AccountingSetting.branch),
        selectinload(setting_model.AccountingSetting.account)
    )
    if branch_id is not None:
        query = query.filter(setting_model.AccountingSetting.branch_id == branch_id)
    if key is not None:
        query = query.filter(setting_model.AccountingSetting.key == key)

    settings = query.order_by(setting_model.AccountingSetting.branch_id, setting_model.AccountingSetting.key).offset(skip).limit(limit).all()
    return settings

@router.get("/{setting_id}", response_model=setting_schema.AccountingSetting)
def read_accounting_setting(
    setting_id: int,
    db: Session = Depends(database.get_db)
):
    db_setting = db.query(setting_model.AccountingSetting).options(
        selectinload(setting_model.AccountingSetting.branch),
        selectinload(setting_model.AccountingSetting.account)
    ).filter(setting_model.AccountingSetting.id == setting_id).first()

    if db_setting is None:
        raise HTTPException(status_code=404, detail="Accounting setting not found")
    return db_setting

# PUT endpoint for specific updates if needed, though POST handles upsert for now.
# If a dedicated update is needed that doesn't allow changing key/branch_id:
@router.put("/{setting_id}", response_model=setting_schema.AccountingSetting)
def update_accounting_setting_value(
    setting_id: int,
    setting_update: setting_schema.AccountingSettingUpdate, # Only allows value_account_id update
    db: Session = Depends(database.get_db)
):
    db_setting = db.query(setting_model.AccountingSetting).filter(setting_model.AccountingSetting.id == setting_id).first()
    if db_setting is None:
        raise HTTPException(status_code=404, detail="Accounting setting not found")

    if setting_update.value_account_id is not None:
        account = db.query(AccountModel).filter(AccountModel.id == setting_update.value_account_id).first()
        if not account:
            raise HTTPException(status_code=404, detail=f"Account with id {setting_update.value_account_id} not found.")
        if account.branch_id != db_setting.branch_id: # Ensure new account belongs to the setting's branch
             raise HTTPException(status_code=400, detail=f"New account (ID: {account.id}) must belong to the setting's branch (ID: {db_setting.branch_id}).")
        db_setting.value_account_id = setting_update.value_account_id

    db.commit()
    db.refresh(db_setting)
    # Eager load for response
    return db.query(setting_model.AccountingSetting).options(
        selectinload(setting_model.AccountingSetting.branch),
        selectinload(setting_model.AccountingSetting.account)
    ).filter(setting_model.AccountingSetting.id == db_setting.id).first()


@router.delete("/{setting_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_accounting_setting(
    setting_id: int,
    db: Session = Depends(database.get_db)
):
    db_setting = db.query(setting_model.AccountingSetting).filter(setting_model.AccountingSetting.id == setting_id).first()
    if db_setting is None:
        raise HTTPException(status_code=404, detail="Accounting setting not found")

    db.delete(db_setting)
    db.commit()
    return None
