import axios, { AxiosError } from 'axios';
import { JournalEntry, JournalEntryCreateData } from '@/types/journalEntry';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const getAuthHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const handleError = (error: AxiosError | Error, defaultMessage: string) => {
  if (axios.isAxiosError(error) && error.response) {
    // Handle FastAPI validation errors specifically if they are in error.response.data.detail
    if (error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data) {
      const detail = (error.response.data as any).detail;
      if (typeof detail === 'string') {
        return detail;
      } else if (Array.isArray(detail)) { // FastAPI validation errors often are arrays
        return detail.map((err: any) => `${err.loc.join(' -> ')}: ${err.msg}`).join('; ');
      }
    }
    return (error.response.data as any)?.detail || defaultMessage;
  }
  return error.message || defaultMessage;
};

interface GetJournalEntriesParams {
  skip?: number;
  limit?: number;
  branchId?: number | 'all';
  entryDateStart?: string; // ISO "YYYY-MM-DD"
  entryDateEnd?: string;   // ISO "YYYY-MM-DD"
  accountId?: number;
}

export const getJournalEntries = async (token: string, params: GetJournalEntriesParams = {}): Promise<JournalEntry[]> => {
  try {
    const queryParams: any = {
      skip: params.skip,
      limit: params.limit,
      entry_date_start: params.entryDateStart,
      entry_date_end: params.entryDateEnd,
      account_id: params.accountId,
    };
    if (typeof params.branchId === 'number') {
      queryParams.branch_id = params.branchId;
    }
    Object.keys(queryParams).forEach(key => queryParams[key] === undefined && delete queryParams[key]);

    const response = await axios.get<JournalEntry[]>(`${API_BASE_URL}/journal-entries/`, {
      ...getAuthHeaders(token),
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to fetch journal entries.'));
  }
};

export const getJournalEntryById = async (token: string, id: number): Promise<JournalEntry> => {
  try {
    const response = await axios.get<JournalEntry>(`${API_BASE_URL}/journal-entries/${id}`, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to fetch journal entry.'));
  }
};

export const createJournalEntry = async (token: string, data: JournalEntryCreateData): Promise<JournalEntry> => {
  try {
    const response = await axios.post<JournalEntry>(`${API_BASE_URL}/journal-entries/`, data, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to create journal entry.'));
  }
};

// Update/Delete for Journal Entries are often handled by creating reversing entries,
// so direct PUT/DELETE might not be standard. Omitting for now as per plan.

export default {
  getJournalEntries,
  getJournalEntryById,
  createJournalEntry,
};
