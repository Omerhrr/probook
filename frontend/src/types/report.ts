// Used for sending date range queries
export interface DateRangeQuery {
  start_date: string; // ISO date string, e.g., "YYYY-MM-DD"
  end_date: string;   // ISO date string
}

export interface RevenueReport {
  start_date: string; // ISO date string
  end_date: string;   // ISO date string
  total_revenue: number;
  // If backend includes contributing_sales, define that array here
  // contributing_sales?: Sale[];
}

export interface TotalExpensesReport {
  start_date: string; // ISO date string
  end_date: string;   // ISO date string
  total_expenses: number;
  // If backend includes contributing_expenses, define that array here
  // contributing_expenses?: Expense[];
}

export interface ProfitLossReport {
  start_date: string; // ISO date string
  end_date: string;   // ISO date string
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
}
