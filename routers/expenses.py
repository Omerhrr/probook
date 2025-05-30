from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import date

from database import get_db
from models.user import User as UserModel
from models.supplier import Supplier as SupplierModel
from models.expense import Expense as ExpenseModel
from schemas.expense import Expense, ExpenseCreate, ExpenseUpdate
from dependencies import get_current_active_user

router = APIRouter(
    prefix="/expenses",
    tags=["expenses"],
    dependencies=[Depends(get_current_active_user)]
)

@router.post("/", response_model=Expense)
def create_expense(expense_data: ExpenseCreate, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    if expense_data.supplier_id:
        supplier = db.query(SupplierModel).filter(SupplierModel.id == expense_data.supplier_id, SupplierModel.owner_id == current_user.id).first()
        if not supplier:
            raise HTTPException(status_code=404, detail=f"Supplier with id {expense_data.supplier_id} not found for this owner.")

    db_expense = ExpenseModel(
        **expense_data.model_dump(exclude_unset=True), # Use exclude_unset for optional fields like expense_date
        owner_id=current_user.id
    )
    if expense_data.expense_date is None: # Ensure server default for date is used if not provided
        db_expense.expense_date = None # Let SQLAlchemy handle server_default

    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    # Manually load supplier for the response if necessary, or rely on Pydantic's orm_mode
    # For orm_mode, ensure the session is active and the relationship is loaded or can be lazy-loaded.
    # The Expense schema expects a `supplier` object if supplier_id is not None.
    # Pydantic's `orm_mode` will attempt to access `db_expense.supplier`.
    # SQLAlchemy will lazy-load this relationship if it hasn't been loaded,
    # provided the session is still active.
    return db_expense

@router.get("/{expense_id}", response_model=Expense)
def read_expense(expense_id: int, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    # Use options for eager loading related supplier if desired for performance,
    # from sqlalchemy.orm import selectinload
    # db_expense = db.query(ExpenseModel).options(selectinload(ExpenseModel.supplier)).filter(ExpenseModel.id == expense_id, ExpenseModel.owner_id == current_user.id).first()
    db_expense = db.query(ExpenseModel).filter(ExpenseModel.id == expense_id, ExpenseModel.owner_id == current_user.id).first()
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found or not owned by user")
    return db_expense

@router.get("/", response_model=List[Expense])
def read_expenses(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    query = db.query(ExpenseModel).filter(ExpenseModel.owner_id == current_user.id)
    if category:
        query = query.filter(ExpenseModel.category.ilike(f"%{category}%"))
    if start_date:
        query = query.filter(ExpenseModel.expense_date >= start_date)
    if end_date:
        query = query.filter(ExpenseModel.expense_date <= end_date)

    # Eager load supplier details for the list if it's common to display them
    # query = query.options(selectinload(ExpenseModel.supplier))
    expenses = query.offset(skip).limit(limit).all()
    return expenses

@router.put("/{expense_id}", response_model=Expense)
def update_expense(expense_id: int, expense_data: ExpenseUpdate, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    db_expense = db.query(ExpenseModel).filter(ExpenseModel.id == expense_id, ExpenseModel.owner_id == current_user.id).first()
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")

    if expense_data.supplier_id and expense_data.supplier_id != db_expense.supplier_id:
        supplier = db.query(SupplierModel).filter(SupplierModel.id == expense_data.supplier_id, SupplierModel.owner_id == current_user.id).first()
        if not supplier:
            raise HTTPException(status_code=404, detail=f"Supplier with id {expense_data.supplier_id} not found for this owner.")

    update_data = expense_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_expense, key, value)

    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    # Pydantic's orm_mode will handle serializing db_expense,
    # including the supplier relationship if supplier_id is set.
    # SQLAlchemy will lazy-load db_expense.supplier if accessed and not already loaded.
    return db_expense

@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(expense_id: int, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    db_expense = db.query(ExpenseModel).filter(ExpenseModel.id == expense_id, ExpenseModel.owner_id == current_user.id).first()
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(db_expense)
    db.commit()
    return None
