from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import date

from database import get_db
from models.user import User as UserModel
from sqlalchemy.orm import Session, selectinload # Added selectinload
from datetime import date

from database import get_db
from models.user import User as UserModel
from models.supplier import Supplier as SupplierModel
from models.expense import Expense as ExpenseModel
from models.branch import Branch as BranchModel # For branch validation
from schemas.expense import Expense, ExpenseCreate, ExpenseUpdate
# Updated dependencies
from dependencies import get_current_active_user, get_current_admin_user, get_current_branch_manager_user, get_admin_or_branch_manager_user


router = APIRouter(
    prefix="/expenses",
    tags=["expenses"]
    # Dependencies applied per-route
)

@router.post("/", response_model=Expense, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense_data: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_admin_or_branch_manager_user)
):
    target_branch_id = expense_data.branch_id
    final_branch_id: int

    if current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager not assigned to a branch.")
        if target_branch_id != current_user.branch_id:
            raise HTTPException(status_code=403, detail=f"Branch managers can only create expenses for their own branch (Branch ID: {current_user.branch_id}).")
        final_branch_id = current_user.branch_id
    elif current_user.role.name.lower() == "admin":
        if not target_branch_id:
            raise HTTPException(status_code=400, detail="Admin must specify a branch_id for the expense.")
        final_branch_id = target_branch_id
    else:
        raise HTTPException(status_code=403, detail="Not authorized to create expenses.")

    if not db.query(BranchModel).filter(BranchModel.id == final_branch_id).first():
        raise HTTPException(status_code=404, detail=f"Branch with id {final_branch_id} not found.")

    # Validate supplier if provided and ensure supplier belongs to the same branch
    if expense_data.supplier_id:
        supplier = db.query(SupplierModel).filter(SupplierModel.id == expense_data.supplier_id).first()
        if not supplier:
            raise HTTPException(status_code=404, detail=f"Supplier with id {expense_data.supplier_id} not found.")
        if supplier.branch_id != final_branch_id:
            raise HTTPException(status_code=400, detail=f"Supplier (ID: {supplier.id}) does not belong to the target branch (ID: {final_branch_id}).")

    expense_dict = expense_data.model_dump(exclude_unset=True)
    expense_dict['branch_id'] = final_branch_id

    # Handle expense_date: if None, model's server_default will take over.
    # If provided, it should be a valid date string. Pydantic schema handles this.
    # The owner_id is the user who created it.
    db_expense = ExpenseModel(**expense_dict, owner_id=current_user.id)

    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    # Eager load supplier and branch for the response
    # db.refresh(db_expense, attribute_names=['supplier', 'branch']) # Or query again with options
    return db_expense

    # Query again to ensure relationships are loaded for the response as per schema
    # This is crucial if `lazy="joined"` is not consistently loading or if session state is tricky.
    # For explicit loading after commit:
    response_expense = db.query(ExpenseModel).options(
        selectinload(ExpenseModel.supplier),
        selectinload(ExpenseModel.branch)
    ).filter(ExpenseModel.id == db_expense.id).first()
    return response_expense


@router.get("/{expense_id}", response_model=Expense)
def read_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    query = db.query(ExpenseModel).options(
        selectinload(ExpenseModel.supplier),
        selectinload(ExpenseModel.branch)
    )
    db_expense = query.filter(ExpenseModel.id == expense_id).first()

    if db_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")

    if current_user.role.name.lower() == "admin":
        return db_expense
    elif current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id or db_expense.branch_id != current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager can only view expenses from their own branch.")
        return db_expense
    else:
        raise HTTPException(status_code=403, detail="Not authorized to view this expense.")


@router.get("/", response_model=List[Expense])
def read_expenses(
    branch_id_query: Optional[int] = Query(None, alias="branch_id"), # Renamed to avoid conflict
    category: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    query = db.query(ExpenseModel).options(
        selectinload(ExpenseModel.supplier),
        selectinload(ExpenseModel.branch)
    ) # Eager load for list

    if current_user.role.name.lower() == "admin":
        if branch_id_query:
            query = query.filter(ExpenseModel.branch_id == branch_id_query)
    elif current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager not assigned to a branch.")
        query = query.filter(ExpenseModel.branch_id == current_user.branch_id)
        if branch_id_query and branch_id_query != current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch managers can only list expenses for their own branch.")
    else:
        raise HTTPException(status_code=403, detail="Not authorized to list expenses.")

    if category:
        query = query.filter(ExpenseModel.category.ilike(f"%{category}%"))
    if start_date:
        query = query.filter(ExpenseModel.expense_date >= start_date)
    if end_date:
        query = query.filter(ExpenseModel.expense_date <= end_date)

    expenses = query.order_by(ExpenseModel.expense_date.desc()).offset(skip).limit(limit).all()
    return expenses

@router.put("/{expense_id}", response_model=Expense)
def update_expense(
    expense_id: int,
    expense_data: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_admin_or_branch_manager_user)
):
    db_expense = db.query(ExpenseModel).filter(ExpenseModel.id == expense_id).first()
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")

    target_branch_id = expense_data.branch_id if expense_data.branch_id is not None else db_expense.branch_id

    if current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id or db_expense.branch_id != current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager can only update expenses from their own branch.")
        if expense_data.branch_id is not None and expense_data.branch_id != current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager cannot change the expense's branch.")
        final_branch_id = current_user.branch_id # Cannot change branch
    elif current_user.role.name.lower() == "admin":
        if expense_data.branch_id is not None and expense_data.branch_id != db_expense.branch_id:
            if not db.query(BranchModel).filter(BranchModel.id == expense_data.branch_id).first():
                raise HTTPException(status_code=404, detail=f"Target branch with id {expense_data.branch_id} not found.")
            final_branch_id = expense_data.branch_id
        else:
            final_branch_id = db_expense.branch_id # Keep original if not changed by admin
    else: # Should not happen
        raise HTTPException(status_code=403, detail="Not authorized.")

    # Validate supplier if provided and ensure supplier belongs to the final_branch_id
    if expense_data.supplier_id is not None: # If supplier_id is being set or changed
        if expense_data.supplier_id is None: # Clearing supplier
             pass # This is fine
        else: # Setting to a new supplier
            supplier = db.query(SupplierModel).filter(SupplierModel.id == expense_data.supplier_id).first()
            if not supplier:
                raise HTTPException(status_code=404, detail=f"Supplier with id {expense_data.supplier_id} not found.")
            if supplier.branch_id != final_branch_id:
                raise HTTPException(status_code=400, detail=f"Supplier (ID: {supplier.id}) does not belong to the expense's branch (ID: {final_branch_id}).")

    update_dict = expense_data.model_dump(exclude_unset=True)
    update_dict['branch_id'] = final_branch_id # Ensure correct branch_id is set

    for key, value in update_dict.items():
        setattr(db_expense, key, value)

    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    # Query again to ensure relationships are loaded for the response
    response_expense = db.query(ExpenseModel).options(
        selectinload(ExpenseModel.supplier),
        selectinload(ExpenseModel.branch)
    ).filter(ExpenseModel.id == db_expense.id).first()
    return response_expense


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_admin_or_branch_manager_user)
):
    db_expense = db.query(ExpenseModel).filter(ExpenseModel.id == expense_id).first()
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(db_expense)
    db.commit()
    return None
