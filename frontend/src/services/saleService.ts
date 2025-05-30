import axios, { AxiosError } from 'axios';
import { Sale, SaleCreateData } from '@/types/sale';

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

export const getSales = async (
  token: string,
  skip: number = 0,
  limit: number = 100,
  branchId?: number | 'all', // Added branchId
  customerId?: number | null // Existing customerId filter
): Promise<Sale[]> => {
  try {
    let url = `${API_BASE_URL}/sales/?skip=${skip}&limit=${limit}`;
    if (typeof branchId === 'number') {
      url += `&branch_id=${branchId}`;
    }
    if (customerId) {
      url += `&customer_id=${customerId}`;
    }
    // If branchId is 'all' or undefined for admin, backend returns all (or all for that customer).
    // If user is branch manager, backend scopes to their branch.
    const response = await axios.get<Sale[]>(url, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to fetch sales.'));
  }
};

export const getSaleById = async (token: string, saleId: number): Promise<Sale> => {
  try {
    const response = await axios.get<Sale>(
      `${API_BASE_URL}/sales/${saleId}`,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to fetch sale details.'));
  }
};

export const createSale = async (token: string, saleData: SaleCreateData): Promise<Sale> => {
  try {
    const response = await axios.post<Sale>(
      `${API_BASE_URL}/sales/`,
      saleData,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    // More detailed error for create sale if backend provides specific item errors
    if (axios.isAxiosError(error) && error.response && error.response.data) {
        const responseData = error.response.data as any;
        if (responseData.detail && Array.isArray(responseData.detail)) { // Handle FastAPI validation errors
            let messages = responseData.detail.map((err: any) => `${err.loc.join(' -> ')}: ${err.msg}`).join('; ');
            throw new Error(messages || 'Failed to create sale due to validation errors.');
        } else if (responseData.detail) {
            throw new Error(String(responseData.detail));
        }
    }
    throw new Error(handleError(error as AxiosError, 'Failed to create sale.'));
  }
};

export default {
  getSales,
  getSaleById,
  createSale,
};
