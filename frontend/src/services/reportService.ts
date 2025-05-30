import axios, { AxiosError } from 'axios';
import { RevenueReport, TotalExpensesReport, ProfitLossReport } from '@/types/report';

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

export const getRevenueReport = async (
  token: string,
  start_date: string,
  end_date: string,
  branchId?: number | 'all'
): Promise<RevenueReport> => {
  try {
    const params: any = { start_date, end_date };
    if (typeof branchId === 'number') {
      params.branch_id = branchId;
    }
    // If branchId is 'all' or undefined, no branch_id param is sent, backend handles logic.
    const response = await axios.get<RevenueReport>(`${API_BASE_URL}/reports/revenue/`, {
      ...getAuthHeaders(token),
      params: params,
    });
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to fetch revenue report.'));
  }
};

export const getTotalExpensesReport = async (
  token: string,
  start_date: string,
  end_date: string,
  branchId?: number | 'all'
): Promise<TotalExpensesReport> => {
  try {
    const params: any = { start_date, end_date };
    if (typeof branchId === 'number') {
      params.branch_id = branchId;
    }
    const response = await axios.get<TotalExpensesReport>(`${API_BASE_URL}/reports/total-expenses/`, {
      ...getAuthHeaders(token),
      params: params,
    });
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to fetch total expenses report.'));
  }
};

export const getProfitLossReport = async (
  token: string,
  start_date: string,
  end_date: string,
  branchId?: number | 'all'
): Promise<ProfitLossReport> => {
  try {
    const params: any = { start_date, end_date };
    if (typeof branchId === 'number') {
      params.branch_id = branchId;
    }
    const response = await axios.get<ProfitLossReport>(`${API_BASE_URL}/reports/profit-loss/`, {
      ...getAuthHeaders(token),
      params: params,
    });
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to fetch profit/loss report.'));
  }
};

export default {
  getRevenueReport,
  getTotalExpensesReport,
  getProfitLossReport,
};
