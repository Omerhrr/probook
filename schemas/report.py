from pydantic import BaseModel
from datetime import date
from typing import List, Optional
from .sale import Sale as SaleSchema # To include list of sales in revenue report, if desired

class ReportDateRangeQuery(BaseModel):
    start_date: date
    end_date: date

class RevenueReportSchema(BaseModel):
    start_date: date
    end_date: date
    total_revenue: float
    # Optional: include a list of sales that contributed to this revenue
    # contributing_sales: List[SaleSchema] = []

class TotalExpensesReportSchema(BaseModel):
    start_date: date
    end_date: date
    total_expenses: float

class ProfitLossReportSchema(BaseModel):
    start_date: date
    end_date: date
    total_revenue: float
    total_expenses: float
    net_profit: float
