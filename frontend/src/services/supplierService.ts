import axios, { AxiosError } from 'axios';
import { Supplier, SupplierCreateData, SupplierUpdateData } from '@/types/supplier';

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

export const getSuppliers = async (
  token: string,
  skip: number = 0,
  limit: number = 100
): Promise<Supplier[]> => {
  try {
    const response = await axios.get<Supplier[]>(
      `${API_BASE_URL}/suppliers/?skip=${skip}&limit=${limit}`,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to fetch suppliers.'));
  }
};

export const getSupplierById = async (token: string, supplierId: number): Promise<Supplier> => {
  try {
    const response = await axios.get<Supplier>(
      `${API_BASE_URL}/suppliers/${supplierId}`,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to fetch supplier.'));
  }
};

export const createSupplier = async (token: string, supplierData: SupplierCreateData): Promise<Supplier> => {
  try {
    const response = await axios.post<Supplier>(
      `${API_BASE_URL}/suppliers/`,
      supplierData,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to create supplier.'));
  }
};

export const updateSupplier = async (
  token: string,
  supplierId: number,
  supplierData: SupplierUpdateData
): Promise<Supplier> => {
  try {
    const response = await axios.put<Supplier>(
      `${API_BASE_URL}/suppliers/${supplierId}`,
      supplierData,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to update supplier.'));
  }
};

export const deleteSupplier = async (token: string, supplierId: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/suppliers/${supplierId}`, getAuthHeaders(token));
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to delete supplier.'));
  }
};

export default {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
