import axios, { AxiosError } from 'axios';
import { Expense, ExpenseCreateData, ExpenseUpdateData } from '@/types/expense';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Helper for auth headers
const getAuthHeaders = (token: string) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Error handling helper
const handleError = (error: AxiosError | Error, defaultMessage: string) => {
  if (axios.isAxiosError(error) && error.response) {
    return (error.response.data as any)?.detail || defaultMessage;
  }
  return error.message || defaultMessage;
};

interface GetExpensesParams {
  skip?: number;
  limit?: number;
  category?: string;
  start_date?: string;
  end_date?: string;
  branchId?: number | 'all'; // Added branchId
}

export const getExpenses = async (
  token: string,
  params: GetExpensesParams = {}
): Promise<Expense[]> => {
  try {
    const queryParams: any = { ...params };
    if (params.branchId && typeof params.branchId === 'number') {
      queryParams.branch_id = params.branchId; // Map to backend's expected param name
    }
    delete queryParams.branchId; // Remove frontend-specific name before sending

    const response = await axios.get<Expense[]>(`${API_BASE_URL}/expenses/`, {
      ...getAuthHeaders(token),
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to fetch expenses.'));
  }
};

export const getExpenseById = async (token: string, expenseId: number): Promise<Expense> => {
  try {
    const response = await axios.get<Expense>(
      `${API_BASE_URL}/expenses/${expenseId}`,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to fetch expense details.'));
  }
};

export const createExpense = async (token: string, expenseData: ExpenseCreateData): Promise<Expense> => {
  try {
    const response = await axios.post<Expense>(
      `${API_BASE_URL}/expenses/`,
      expenseData,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to create expense.'));
  }
};

export const updateExpense = async (
  token: string,
  expenseId: number,
  expenseData: ExpenseUpdateData
): Promise<Expense> => {
  try {
    const response = await axios.put<Expense>(
      `${API_BASE_URL}/expenses/${expenseId}`,
      expenseData,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to update expense.'));
  }
};

export const deleteExpense = async (token: string, expenseId: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/expenses/${expenseId}`, getAuthHeaders(token));
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to delete expense.'));
  }
};

export default {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
};
