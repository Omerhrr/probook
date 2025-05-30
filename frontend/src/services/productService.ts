import axios, { AxiosError } from 'axios';
import { Product, ProductCreateData, ProductUpdateData } from '@/types/product'; // Assuming @ is src

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

export const getProducts = async (
  token: string,
  skip: number = 0,
  limit: number = 100
): Promise<Product[]> => {
  try {
    const response = await axios.get<Product[]>(
      `${API_BASE_URL}/products/?skip=${skip}&limit=${limit}`,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to fetch products.'));
  }
};

export const getProductById = async (token: string, productId: number): Promise<Product> => {
  try {
    const response = await axios.get<Product>(
      `${API_BASE_URL}/products/${productId}`,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to fetch product.'));
  }
};

export const createProduct = async (token: string, productData: ProductCreateData): Promise<Product> => {
  try {
    const response = await axios.post<Product>(
      `${API_BASE_URL}/products/`,
      productData,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to create product.'));
  }
};

export const updateProduct = async (
  token: string,
  productId: number,
  productData: ProductUpdateData
): Promise<Product> => {
  try {
    const response = await axios.put<Product>(
      `${API_BASE_URL}/products/${productId}`,
      productData,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to update product.'));
  }
};

export const deleteProduct = async (token: string, productId: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/products/${productId}`, getAuthHeaders(token));
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to delete product.'));
  }
};

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
