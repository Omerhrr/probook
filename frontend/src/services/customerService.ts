import axios, { AxiosError } from 'axios';
import { Customer, CustomerCreateData, CustomerUpdateData } from '@/types/customer';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Helper to create an axios instance with auth token
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

export const getCustomers = async (
  token: string,
  skip: number = 0,
  limit: number = 100,
  branchId?: number | 'all' // Add branchId parameter
): Promise<Customer[]> => {
  try {
    let url = `${API_BASE_URL}/customers/?skip=${skip}&limit=${limit}`;
    if (typeof branchId === 'number') {
      url += `&branch_id=${branchId}`;
    }
    const response = await axios.get<Customer[]>(url, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to fetch customers.'));
  }
};

export const getCustomerById = async (token: string, customerId: number): Promise<Customer> => {
  try {
    const response = await axios.get<Customer>(
      `${API_BASE_URL}/customers/${customerId}`,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to fetch customer.'));
  }
};

export const createCustomer = async (token: string, customerData: CustomerCreateData): Promise<Customer> => {
  try {
    const response = await axios.post<Customer>(
      `${API_BASE_URL}/customers/`,
      customerData,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to create customer.'));
  }
};

export const updateCustomer = async (
  token: string,
  customerId: number,
  customerData: CustomerUpdateData
): Promise<Customer> => {
  try {
    const response = await axios.put<Customer>(
      `${API_BASE_URL}/customers/${customerId}`,
      customerData,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to update customer.'));
  }
};

export const deleteCustomer = async (token: string, customerId: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/customers/${customerId}`, getAuthHeaders(token));
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to delete customer.'));
  }
};

export default {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
