import axios, { AxiosError } from 'axios';
import { User, UserCreateDataAdmin, UserUpdateDataAdmin } from '@/types/user';

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

// Admin: Get all users
export const getUsers = async (token: string, skip: number = 0, limit: number = 100): Promise<User[]> => {
  try {
    const response = await axios.get<User[]>(`${API_BASE_URL}/users/?skip=${skip}&limit=${limit}`, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to fetch users.'));
  }
};

// Admin: Get a specific user by ID
export const getUserById = async (token: string, userId: number): Promise<User> => {
  try {
    const response = await axios.get<User>(`${API_BASE_URL}/users/${userId}`, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to fetch user.'));
  }
};

// Admin: Create a new user
export const createUserByAdmin = async (token: string, userData: UserCreateDataAdmin): Promise<User> => {
  try {
    const response = await axios.post<User>(`${API_BASE_URL}/users/`, userData, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to create user.'));
  }
};

// Admin: Update a user
export const updateUserByAdmin = async (token: string, userId: number, userData: UserUpdateDataAdmin): Promise<User> => {
  try {
    const response = await axios.put<User>(`${API_BASE_URL}/users/${userId}`, userData, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to update user.'));
  }
};

// Admin: Delete a user
export const deleteUserByAdmin = async (token: string, userId: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/users/${userId}`, getAuthHeaders(token));
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to delete user.'));
  }
};

export default {
  getUsers,
  getUserById,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
};
