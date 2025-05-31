import axios, { AxiosError } from 'axios';
import { Account, AccountCreateData, AccountUpdateData, AccountLookup } from '@/types/account';

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

interface GetAccountsParams {
  skip?: number;
  limit?: number;
  branchId?: number | 'all'; // Mapped to branch_id in query
  accountTypeId?: number;    // Mapped to account_type_id
  isActive?: boolean;        // Mapped to is_active
  name?: string;             // For searching by name (if backend supports)
}

export const getAccounts = async (token: string, params: GetAccountsParams = {}): Promise<Account[]> => {
  try {
    const queryParams: any = {
      skip: params.skip,
      limit: params.limit,
      account_type_id: params.accountTypeId,
      is_active: params.isActive,
      name: params.name,
    };
    if (typeof params.branchId === 'number') {
      queryParams.branch_id = params.branchId;
    }
    // Remove undefined keys so they don't get sent as query params
    Object.keys(queryParams).forEach(key => queryParams[key] === undefined && delete queryParams[key]);

    const response = await axios.get<Account[]>(`${API_BASE_URL}/accounts/`, {
      ...getAuthHeaders(token),
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to fetch accounts.'));
  }
};

// Simplified version for parent account lookups - might need more specific filtering
export const getAccountLookups = async (token: string, branchId: number, currentAccountId?:number ): Promise<AccountLookup[]> => {
    try {
        const params: any = { branch_id: branchId, limit: 1000 }; // Limit to 1000 for dropdown
        const response = await axios.get<Account[]>(`${API_BASE_URL}/accounts/`, {
             ...getAuthHeaders(token),
             params
        });
        // Filter out the current account itself if an ID is provided (to avoid self-parenting in edit)
        return response.data
            .filter(acc => currentAccountId ? acc.id !== currentAccountId : true)
            .map(acc => ({ id: acc.id, name: acc.name, account_code: acc.account_code, branch_id: acc.branch_id }));
    } catch (error) {
        throw new Error(handleError(error as AxiosError, 'Failed to fetch accounts for lookup.'));
    }
}


export const getAccountById = async (token: string, id: number): Promise<Account> => {
  try {
    const response = await axios.get<Account>(`${API_BASE_URL}/accounts/${id}`, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to fetch account.'));
  }
};

export const createAccount = async (token: string, data: AccountCreateData): Promise<Account> => {
  try {
    const response = await axios.post<Account>(`${API_BASE_URL}/accounts/`, data, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to create account.'));
  }
};

export const updateAccount = async (token: string, id: number, data: AccountUpdateData): Promise<Account> => {
  try {
    const response = await axios.put<Account>(`${API_BASE_URL}/accounts/${id}`, data, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to update account.'));
  }
};

export const deleteAccount = async (token: string, id: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/accounts/${id}`, getAuthHeaders(token));
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to delete account.'));
  }
};

export default {
  getAccounts,
  getAccountLookups,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
};
