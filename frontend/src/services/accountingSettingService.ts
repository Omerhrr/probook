import axios, { AxiosError } from 'axios';
import { AccountingSetting, AccountingSettingCreateData, AccountingSettingUpdateData } from '@/types/accountingSetting';

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

// Get all settings for a specific branch
export const getAccountingSettingsForBranch = async (token: string, branchId: number): Promise<AccountingSetting[]> => {
  try {
    const response = await axios.get<AccountingSetting[]>(
      `${API_BASE_URL}/accounting-settings/?branch_id=${branchId}`,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to fetch accounting settings for branch.'));
  }
};

// Create or Update a specific setting (backend handles upsert on POST)
export const upsertAccountingSetting = async (token: string, data: AccountingSettingCreateData): Promise<AccountingSetting> => {
  try {
    const response = await axios.post<AccountingSetting>(`${API_BASE_URL}/accounting-settings/`, data, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to save accounting setting.'));
  }
};

// Get a specific setting by its ID (less used due to upsert, but good for completeness)
export const getAccountingSettingById = async (token: string, settingId: number): Promise<AccountingSetting> => {
    try {
        const response = await axios.get<AccountingSetting>(`${API_BASE_URL}/accounting-settings/${settingId}`, getAuthHeaders(token));
        return response.data;
    } catch (error) {
        throw new Error(handleError(error as AxiosError, 'Failed to fetch accounting setting by ID.'));
    }
};

// Delete a setting by its ID
export const deleteAccountingSetting = async (token: string, settingId: number): Promise<void> => {
    try {
        await axios.delete(`${API_BASE_URL}/accounting-settings/${settingId}`, getAuthHeaders(token));
    } catch (error) {
        throw new Error(handleError(error as AxiosError, 'Failed to delete accounting setting.'));
    }
};


export default {
  getAccountingSettingsForBranch,
  upsertAccountingSetting,
  getAccountingSettingById,
  deleteAccountingSetting
};
