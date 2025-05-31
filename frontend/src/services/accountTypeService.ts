import axios, { AxiosError } from 'axios';
import { AccountType, AccountTypeCreateData, AccountTypeUpdateData } from '@/types/accountType';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const getAuthHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const handleError = (error: AxiosError | Error, defaultMessage: string) => {
  if (axios.isAxiosError(error) && error.response) {
    return (error.response.data as any)?.detail || defaultMessage;
  }
  return error.message || defaultMessage;
};

export const getAccountTypes = async (token: string, skip: number = 0, limit: number = 100): Promise<AccountType[]> => {
  try {
    const response = await axios.get<AccountType[]>(`${API_BASE_URL}/account-types/?skip=${skip}&limit=${limit}`, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to fetch account types.'));
  }
};

export const getAccountTypeById = async (token: string, id: number): Promise<AccountType> => {
  try {
    const response = await axios.get<AccountType>(`${API_BASE_URL}/account-types/${id}`, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to fetch account type.'));
  }
};

export const createAccountType = async (token: string, data: AccountTypeCreateData): Promise<AccountType> => {
  try {
    const response = await axios.post<AccountType>(`${API_BASE_URL}/account-types/`, data, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to create account type.'));
  }
};

export const updateAccountType = async (token: string, id: number, data: AccountTypeUpdateData): Promise<AccountType> => {
  try {
    const response = await axios.put<AccountType>(`${API_BASE_URL}/account-types/${id}`, data, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to update account type.'));
  }
};

export const deleteAccountType = async (token: string, id: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/account-types/${id}`, getAuthHeaders(token));
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to delete account type.'));
  }
};

export default {
  getAccountTypes,
  getAccountTypeById,
  createAccountType,
  updateAccountType,
  deleteAccountType,
};
