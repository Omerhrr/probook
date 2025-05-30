from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from typing import Optional

from database import get_db
from models.user import User as UserModel
from fastapi import APIRouter, Depends, HTTPException, Query # Added HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from typing import Optional

from database import get_db
from models.user import User as UserModel
from models.sale import Sale as SaleModel
from models.expense import Expense as ExpenseModel
from schemas.report import RevenueReportSchema, TotalExpensesReportSchema, ProfitLossReportSchema
# Updated dependency
from dependencies import get_admin_or_branch_manager_user

router = APIRouter(
    prefix="/reports",
    tags=["reports"]
    # Dependencies applied per-route
)


@router.get("/revenue/", response_model=RevenueReportSchema)
def get_revenue_report(
    start_date: date = Query(..., description="Start date for the report period"),
    end_date: date = Query(..., description="End date for the report period"),
    branch_id: Optional[int] = Query(None, description="Branch ID to filter by (Admin only)"),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_admin_or_branch_manager_user)
):
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="Start date cannot be after end date.")

    query = db.query(func.sum(SaleModel.total_amount))

    # Common filters
    query = query.filter(
        SaleModel.sale_date >= start_date,
        SaleModel.sale_date <= end_date
    )

    if current_user.role.name.lower() == "admin":
        if branch_id:
            query = query.filter(SaleModel.branch_id == branch_id)
        # If no branch_id, admin gets sum across all branches (no additional branch filter)
    elif current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id:
             raise HTTPException(status_code=403, detail="Branch manager not assigned to a branch.")
        # Branch manager sees only their branch; branch_id param is ignored if they try to set it
        query = query.filter(SaleModel.branch_id == current_user.branch_id)

    total_revenue = query.scalar() or 0.0

    return RevenueReportSchema(
        start_date=start_date,
        end_date=end_date,
        total_revenue=total_revenue
    )

@router.get("/total-expenses/", response_model=TotalExpensesReportSchema)
def get_total_expenses_report(
    start_date: date = Query(..., description="Start date for the report period"),
    end_date: date = Query(..., description="End date for the report period"),
    branch_id: Optional[int] = Query(None, description="Branch ID to filter by (Admin only)"),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_admin_or_branch_manager_user)
):
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="Start date cannot be after end date.")

    query = db.query(func.sum(ExpenseModel.amount))

    query = query.filter(
        ExpenseModel.expense_date >= start_date,
        ExpenseModel.expense_date <= end_date
    )

    if current_user.role.name.lower() == "admin":
        if branch_id:
            query = query.filter(ExpenseModel.branch_id == branch_id)
    elif current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id:
             raise HTTPException(status_code=403, detail="Branch manager not assigned to a branch.")
        query = query.filter(ExpenseModel.branch_id == current_user.branch_id)

    total_expenses = query.scalar() or 0.0

    return TotalExpensesReportSchema(
        start_date=start_date,
        end_date=end_date,
        total_expenses=total_expenses
    )

@router.get("/profit-loss/", response_model=ProfitLossReportSchema)
def get_profit_loss_report(
    start_date: date = Query(..., description="Start date for the report period"),
    end_date: date = Query(..., description="End date for the report period"),
    branch_id: Optional[int] = Query(None, description="Branch ID to filter by (Admin only)"),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_admin_or_branch_manager_user)
):
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="Start date cannot be after end date.")

    # Revenue Query
    revenue_query = db.query(func.sum(SaleModel.total_amount)).filter(
        SaleModel.sale_date >= start_date,
        SaleModel.sale_date <= end_date
    )
    # Expense Query
    expense_query = db.query(func.sum(ExpenseModel.amount)).filter(
        ExpenseModel.expense_date >= start_date,
        ExpenseModel.expense_date <= end_date
    )

    if current_user.role.name.lower() == "admin":
        if branch_id:
            revenue_query = revenue_query.filter(SaleModel.branch_id == branch_id)
            expense_query = expense_query.filter(ExpenseModel.branch_id == branch_id)
    elif current_user.role.name.lower() == "branch_manager":
        if not current_user.branch_id:
            raise HTTPException(status_code=403, detail="Branch manager not assigned to a branch.")
        revenue_query = revenue_query.filter(SaleModel.branch_id == current_user.branch_id)
        expense_query = expense_query.filter(ExpenseModel.branch_id == current_user.branch_id)

    total_revenue = revenue_query.scalar() or 0.0
    total_expenses = expense_query.scalar() or 0.0
    net_profit = total_revenue - total_expenses

    return ProfitLossReportSchema(
        start_date=start_date,
        end_date=end_date,
        total_revenue=total_revenue,
        total_expenses=total_expenses,
        net_profit=net_profit
    )
