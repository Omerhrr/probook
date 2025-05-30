import axios, { AxiosError } from 'axios';
import { Branch, BranchCreateData, BranchUpdateData } from '@/types/branch';

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

export const getBranches = async (token: string, skip: number = 0, limit: number = 100): Promise<Branch[]> => {
  try {
    const response = await axios.get<Branch[]>(`${API_BASE_URL}/branches/?skip=${skip}&limit=${limit}`, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to fetch branches.'));
  }
};

export const getBranchById = async (token: string, branchId: number): Promise<Branch> => {
  try {
    const response = await axios.get<Branch>(`${API_BASE_URL}/branches/${branchId}`, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to fetch branch.'));
  }
};

export const createBranch = async (token: string, branchData: BranchCreateData): Promise<Branch> => {
  try {
    const response = await axios.post<Branch>(`${API_BASE_URL}/branches/`, branchData, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to create branch.'));
  }
};

export const updateBranch = async (token: string, branchId: number, branchData: BranchUpdateData): Promise<Branch> => {
  try {
    const response = await axios.put<Branch>(`${API_BASE_URL}/branches/${branchId}`, branchData, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to update branch.'));
  }
};

export const deleteBranch = async (token: string, branchId: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/branches/${branchId}`, getAuthHeaders(token));
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to delete branch.'));
  }
};

export default {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
};
