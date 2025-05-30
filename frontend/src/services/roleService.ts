import axios, { AxiosError } from 'axios';
import { Role } from '@/types/role'; // Assuming Role type is defined

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

// Get all roles (for admin forms, etc.)
export const getRoles = async (token: string, skip: number = 0, limit: number = 100): Promise<Role[]> => {
  try {
    const response = await axios.get<Role[]>(`${API_BASE_URL}/roles/?skip=${skip}&limit=${limit}`, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to fetch roles.'));
  }
};

// Other role CRUD functions can be added here if admins are meant to manage roles dynamically.
// For now, just getRoles as per immediate need for User form.
// export const createRole = async (token: string, roleData: RoleCreateData): Promise<Role> => { ... }
// export const updateRole = async (token: string, roleId: number, roleData: RoleUpdateData): Promise<Role> => { ... }
// etc.

export default {
  getRoles,
};
