from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from typing import Optional

from database import get_db
from models.user import User as UserModel
from models.sale import Sale as SaleModel
from models.expense import Expense as ExpenseModel
from schemas.report import RevenueReportSchema, TotalExpensesReportSchema, ProfitLossReportSchema
from dependencies import get_current_active_user

router = APIRouter(
    prefix="/reports",
    tags=["reports"],
    dependencies=[Depends(get_current_active_user)]
)

# Dependency for date range validation (optional, can also do direct in params)
# async def get_date_range(start_date: date = Query(...), end_date: date = Query(...)):
#     if start_date > end_date:
#         raise HTTPException(status_code=400, detail="Start date cannot be after end date.")
#     return {"start_date": start_date, "end_date": end_date}

@router.get("/revenue/", response_model=RevenueReportSchema)
def get_revenue_report(
    start_date: date = Query(..., description="Start date for the report period"),
    end_date: date = Query(..., description="End date for the report period"),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="Start date cannot be after end date.")

    total_revenue = db.query(func.sum(SaleModel.total_amount)).filter(
        SaleModel.owner_id == current_user.id,
        SaleModel.sale_date >= start_date,
        SaleModel.sale_date <= end_date
    ).scalar() or 0.0 # Ensure 0.0 if None

    return RevenueReportSchema(
        start_date=start_date,
        end_date=end_date,
        total_revenue=total_revenue
    )

@router.get("/total-expenses/", response_model=TotalExpensesReportSchema)
def get_total_expenses_report(
    start_date: date = Query(..., description="Start date for the report period"),
    end_date: date = Query(..., description="End date for the report period"),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="Start date cannot be after end date.")

    total_expenses = db.query(func.sum(ExpenseModel.amount)).filter(
        ExpenseModel.owner_id == current_user.id,
        ExpenseModel.expense_date >= start_date,
        ExpenseModel.expense_date <= end_date
    ).scalar() or 0.0 # Ensure 0.0 if None

    return TotalExpensesReportSchema(
        start_date=start_date,
        end_date=end_date,
        total_expenses=total_expenses
    )

@router.get("/profit-loss/", response_model=ProfitLossReportSchema)
def get_profit_loss_report(
    start_date: date = Query(..., description="Start date for the report period"),
    end_date: date = Query(..., description="End date for the report period"),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="Start date cannot be after end date.")

    total_revenue = db.query(func.sum(SaleModel.total_amount)).filter(
        SaleModel.owner_id == current_user.id,
        SaleModel.sale_date >= start_date,
        SaleModel.sale_date <= end_date
    ).scalar() or 0.0

    total_expenses = db.query(func.sum(ExpenseModel.amount)).filter(
        ExpenseModel.owner_id == current_user.id,
        ExpenseModel.expense_date >= start_date,
        ExpenseModel.expense_date <= end_date
    ).scalar() or 0.0

    net_profit = total_revenue - total_expenses

    return ProfitLossReportSchema(
        start_date=start_date,
        end_date=end_date,
        total_revenue=total_revenue,
        total_expenses=total_expenses,
        net_profit=net_profit
    )
