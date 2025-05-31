from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, selectinload
from typing import List, Optional

import database
import models.account as account_model
import schemas.account as account_schema
import dependencies # For admin dependency
from models.branch import Branch as BranchModel
from models.account_type import AccountType as AccountTypeModel

router = APIRouter(
    prefix="/accounts",
    tags=["Chart of Accounts"],
    dependencies=[Depends(dependencies.get_current_admin_user)] # All routes here require admin
)

@router.post("/", response_model=account_schema.Account, status_code=status.HTTP_201_CREATED)
def create_account(
    account_data: account_schema.AccountCreate,
    db: Session = Depends(database.get_db)
):
    # Validate branch_id
    if not db.query(BranchModel).filter(BranchModel.id == account_data.branch_id).first():
        raise HTTPException(status_code=404, detail=f"Branch with id {account_data.branch_id} not found.")

    # Validate account_type_id
    if not db.query(AccountTypeModel).filter(AccountTypeModel.id == account_data.account_type_id).first():
        raise HTTPException(status_code=404, detail=f"Account Type with id {account_data.account_type_id} not found.")

    # Validate parent_account_id if provided
    if account_data.parent_account_id:
        parent_account = db.query(account_model.Account).filter(account_model.Account.id == account_data.parent_account_id).first()
        if not parent_account:
            raise HTTPException(status_code=404, detail=f"Parent account with id {account_data.parent_account_id} not found.")
        # Ensure parent account belongs to the same branch
        if parent_account.branch_id != account_data.branch_id:
            raise HTTPException(status_code=400, detail="Parent account must belong to the same branch.")

    # Check for uniqueness of name and account_code within the same branch
    # This should ideally be handled by DB constraints, but good to check here too.
    existing_name = db.query(account_model.Account).filter(
        account_model.Account.name == account_data.name,
        account_model.Account.branch_id == account_data.branch_id
    ).first()
    if existing_name:
        raise HTTPException(status_code=400, detail=f"Account name '{account_data.name}' already exists in this branch.")

    if account_data.account_code:
        existing_code = db.query(account_model.Account).filter(
            account_model.Account.account_code == account_data.account_code,
            account_model.Account.branch_id == account_data.branch_id
        ).first()
        if existing_code:
            raise HTTPException(status_code=400, detail=f"Account code '{account_data.account_code}' already exists in this branch.")

    new_account = account_model.Account(**account_data.model_dump())
    db.add(new_account)
    db.commit()
    db.refresh(new_account)
    return new_account

@router.get("/", response_model=List[account_schema.Account])
def read_accounts(
    branch_id: Optional[int] = Query(None),
    account_type_id: Optional[int] = Query(None),
    is_active: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(database.get_db)
):
    query = db.query(account_model.Account).options(
        selectinload(account_model.Account.account_type), # Eager load for schema
        selectinload(account_model.Account.branch)      # Eager load for schema
    )
    if branch_id is not None:
        query = query.filter(account_model.Account.branch_id == branch_id)
    if account_type_id is not None:
        query = query.filter(account_model.Account.account_type_id == account_type_id)
    if is_active is not None:
        query = query.filter(account_model.Account.is_active == is_active)

    accounts = query.order_by(account_model.Account.branch_id, account_model.Account.account_code, account_model.Account.name).offset(skip).limit(limit).all()
    return accounts

@router.get("/{account_id}", response_model=account_schema.Account) # Consider AccountWithChildren if needed
def read_account(
    account_id: int,
    db: Session = Depends(database.get_db)
):
    # Eager load relationships needed for the response schema
    db_account = db.query(account_model.Account).options(
        selectinload(account_model.Account.account_type),
        selectinload(account_model.Account.branch)
        # selectinload(account_model.Account.children) # If using AccountWithChildren schema
    ).filter(account_model.Account.id == account_id).first()

    if db_account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    return db_account

@router.put("/{account_id}", response_model=account_schema.Account)
def update_account(
    account_id: int,
    account_update_data: account_schema.AccountUpdate,
    db: Session = Depends(database.get_db)
):
    db_account = db.query(account_model.Account).filter(account_model.Account.id == account_id).first()
    if db_account is None:
        raise HTTPException(status_code=404, detail="Account not found")

    update_data = account_update_data.model_dump(exclude_unset=True)

    # Validate foreign keys if they are being changed
    if "branch_id" in update_data and update_data["branch_id"] != db_account.branch_id:
        if not db.query(BranchModel).filter(BranchModel.id == update_data["branch_id"]).first():
            raise HTTPException(status_code=404, detail=f"Branch with id {update_data['branch_id']} not found.")

    if "account_type_id" in update_data and update_data["account_type_id"] != db_account.account_type_id:
        if not db.query(AccountTypeModel).filter(AccountTypeModel.id == update_data["account_type_id"]).first():
            raise HTTPException(status_code=404, detail=f"Account Type with id {update_data['account_type_id']} not found.")

    if "parent_account_id" in update_data:
        if update_data["parent_account_id"] is not None:
            parent_account = db.query(account_model.Account).filter(account_model.Account.id == update_data["parent_account_id"]).first()
            if not parent_account:
                raise HTTPException(status_code=404, detail=f"Parent account with id {update_data['parent_account_id']} not found.")
            if parent_account.branch_id != db_account.branch_id and "branch_id" not in update_data: # if branch is not changing at same time
                 raise HTTPException(status_code=400, detail="Parent account must belong to the same branch as the child account.")
            if "branch_id" in update_data and parent_account.branch_id != update_data["branch_id"]: # if branch is changing
                 raise HTTPException(status_code=400, detail="Parent account must belong to the target branch of the child account.")
            if update_data["parent_account_id"] == db_account.id: # Cannot be its own parent
                raise HTTPException(status_code=400, detail="Account cannot be its own parent.")

    # Check for uniqueness of name and account_code within the same branch if changed
    current_branch_id = update_data.get("branch_id", db_account.branch_id)
    if "name" in update_data and update_data["name"] != db_account.name:
        if db.query(account_model.Account).filter(
            account_model.Account.name == update_data["name"],
            account_model.Account.branch_id == current_branch_id,
            account_model.Account.id != account_id # Exclude self
        ).first():
            raise HTTPException(status_code=400, detail=f"Account name '{update_data['name']}' already exists in this branch.")

    if "account_code" in update_data and update_data["account_code"] and update_data["account_code"] != db_account.account_code:
        if db.query(account_model.Account).filter(
            account_model.Account.account_code == update_data["account_code"],
            account_model.Account.branch_id == current_branch_id,
            account_model.Account.id != account_id # Exclude self
        ).first():
            raise HTTPException(status_code=400, detail=f"Account code '{update_data['account_code']}' already exists in this branch.")


    for key, value in update_data.items():
        setattr(db_account, key, value)

    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    # Query again for response to ensure relationships are loaded as per schema
    response_account = db.query(account_model.Account).options(
        selectinload(account_model.Account.account_type),
        selectinload(account_model.Account.branch)
    ).filter(account_model.Account.id == db_account.id).first()
    return response_account


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    account_id: int,
    db: Session = Depends(database.get_db)
):
    db_account = db.query(account_model.Account).filter(account_model.Account.id == account_id).first()
    if db_account is None:
        raise HTTPException(status_code=404, detail="Account not found")

    # Check if this account is a parent to any other accounts
    if db.query(account_model.Account).filter(account_model.Account.parent_account_id == account_id).first():
        raise HTTPException(status_code=400, detail="Cannot delete account: it is a parent to other accounts. Reassign child accounts first.")

    # TODO: Add check if account is used in any ledger entries. This is crucial.
    # For now, direct deletion.

    db.delete(db_account)
    db.commit()
    return None
