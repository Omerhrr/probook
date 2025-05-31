from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, selectinload
from typing import List, Optional
from decimal import Decimal # For precise debit/credit comparison

import database
import models.journal_entry as je_model
import schemas.journal_entry as je_schema
import dependencies
from models.branch import Branch as BranchModel
from models.account import Account as AccountModel
from models.user import User as UserModel

router = APIRouter(
    prefix="/journal-entries",
    tags=["Journal Entries"],
    # For now, let Admin or Branch Manager do this. A specific "Accountant" role could be added later.
    dependencies=[Depends(dependencies.get_admin_or_branch_manager_user)]
)

@router.post("/", response_model=je_schema.JournalEntry, status_code=status.HTTP_201_CREATED)
def create_journal_entry(
    journal_entry_data: je_schema.JournalEntryCreate,
    db: Session = Depends(database.get_db),
    current_user: UserModel = Depends(dependencies.get_admin_or_branch_manager_user)
):
    target_branch_id = journal_entry_data.branch_id
    final_branch_id: int

    if current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager not assigned to a branch.")
        if target_branch_id != current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch managers can only create journal entries for their own branch.")
        final_branch_id = current_user.branch_id
    elif current_user.role.name.lower() == "admin":
        if not target_branch_id: # Admin must specify branch
            raise HTTPException(status_code=400, detail="Admin must specify a branch_id for the journal entry.")
        final_branch_id = target_branch_id
    else: # Should not happen
        raise HTTPException(status_code=403, detail="User not authorized to create journal entries.")

    # Validate branch existence
    if not db.query(BranchModel).filter(BranchModel.id == final_branch_id).first():
        raise HTTPException(status_code=404, detail=f"Branch with id {final_branch_id} not found.")

    # Validate items (debits == credits is handled by Pydantic schema validator)
    if not journal_entry_data.items or len(journal_entry_data.items) < 2:
         raise HTTPException(status_code=400, detail="A journal entry must have at least two items (lines).")

    total_debits = Decimal('0.00')
    total_credits = Decimal('0.00')

    for item_data in journal_entry_data.items:
        # Validate account_id
        account = db.query(AccountModel).filter(AccountModel.id == item_data.account_id).first()
        if not account:
            raise HTTPException(status_code=404, detail=f"Account with id {item_data.account_id} not found.")
        if account.branch_id != final_branch_id:
            raise HTTPException(status_code=400, detail=f"Account '{account.name}' (ID: {account.id}) does not belong to branch {final_branch_id}.")
        if not account.is_active:
            raise HTTPException(status_code=400, detail=f"Account '{account.name}' (ID: {account.id}) is not active.")

        # Accumulate debits and credits using Decimal for precision
        total_debits += Decimal(str(item_data.debit_amount))
        total_credits += Decimal(str(item_data.credit_amount))

    if total_debits != total_credits: # Final check after potential float inaccuracies from input
        raise HTTPException(status_code=400, detail=f"Total debits ({total_debits}) must equal total credits ({total_credits}).")


    db_journal_entry = je_model.JournalEntry(
        entry_date=journal_entry_data.entry_date,
        description=journal_entry_data.description,
        branch_id=final_branch_id,
        created_by_user_id=current_user.id
    )
    db.add(db_journal_entry)
    db.flush() # To get the ID for items

    for item_data in journal_entry_data.items:
        db_item = je_model.JournalEntryItem(
            journal_entry_id=db_journal_entry.id,
            account_id=item_data.account_id,
            debit_amount=Decimal(str(item_data.debit_amount)), # Store as Decimal
            credit_amount=Decimal(str(item_data.credit_amount)), # Store as Decimal
            description=item_data.description
        )
        db.add(db_item)

    db.commit()
    db.refresh(db_journal_entry)
    # Eager load for response
    return db.query(je_model.JournalEntry).options(
        selectinload(je_model.JournalEntry.items).selectinload(je_model.JournalEntryItem.account).selectinload(AccountModel.account_type),
        selectinload(je_model.JournalEntry.branch),
        selectinload(je_model.JournalEntry.created_by).selectinload(UserModel.role)
    ).filter(je_model.JournalEntry.id == db_journal_entry.id).first()


@router.get("/", response_model=List[je_schema.JournalEntry])
def read_journal_entries(
    branch_id_query: Optional[int] = Query(None, alias="branch_id"),
    entry_date_start: Optional[date] = Query(None),
    entry_date_end: Optional[date] = Query(None),
    account_id_filter: Optional[int] = Query(None, alias="account_id"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(database.get_db),
    current_user: UserModel = Depends(dependencies.get_admin_or_branch_manager_user)
):
    query = db.query(je_model.JournalEntry).options(
        selectinload(je_model.JournalEntry.items).selectinload(je_model.JournalEntryItem.account).selectinload(AccountModel.account_type),
        selectinload(je_model.JournalEntry.branch),
        selectinload(je_model.JournalEntry.created_by).selectinload(UserModel.role)
    )

    if current_user.role.name.lower() == "admin":
        if branch_id_query is not None:
            query = query.filter(je_model.JournalEntry.branch_id == branch_id_query)
    elif current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager not assigned to a branch.")
        query = query.filter(je_model.JournalEntry.branch_id == current_user.branch_id)
        if branch_id_query is not None and branch_id_query != current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch managers can only view journal entries for their own branch.")

    if entry_date_start:
        query = query.filter(je_model.JournalEntry.entry_date >= entry_date_start)
    if entry_date_end:
        query = query.filter(je_model.JournalEntry.entry_date <= entry_date_end)

    if account_id_filter: # To find entries involving a specific account
        query = query.join(je_model.JournalEntryItem).filter(je_model.JournalEntryItem.account_id == account_id_filter)

    journal_entries = query.order_by(je_model.JournalEntry.entry_date.desc(), je_model.JournalEntry.id.desc()).offset(skip).limit(limit).all()
    return journal_entries

@router.get("/{journal_entry_id}", response_model=je_schema.JournalEntry)
def read_journal_entry(
    journal_entry_id: int,
    db: Session = Depends(database.get_db),
    current_user: UserModel = Depends(dependencies.get_admin_or_branch_manager_user)
):
    db_journal_entry = db.query(je_model.JournalEntry).options(
        selectinload(je_model.JournalEntry.items).selectinload(je_model.JournalEntryItem.account).selectinload(AccountModel.account_type),
        selectinload(je_model.JournalEntry.branch),
        selectinload(je_model.JournalEntry.created_by).selectinload(UserModel.role)
    ).filter(je_model.JournalEntry.id == journal_entry_id).first()

    if not db_journal_entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    if current_user.role.name.lower() == "admin":
        return db_journal_entry
    elif current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id or db_journal_entry.branch_id != current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager can only view journal entries from their own branch.")
        return db_journal_entry

    # Should not be reached if dependency is correctly applied to the router or specific routes
    raise HTTPException(status_code=403, detail="Not authorized to view this journal entry.")
