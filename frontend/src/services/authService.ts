import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'; // Fallback if not set

// Interface for the token response from /token endpoint
interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Interface for the user creation payload for /users/ endpoint
interface UserCreatePayload {
  username: string;
  email: string;
  password: string;
  full_name?: string; // Optional
  role_id: number;
  branch_id?: number; // Optional
}

// Interface for the expected response when a user is created (or fetched)
// This should align with your backend's User schema (excluding password)
interface UserResponse {
    id: number;
    username: string;
    email: string;
    full_name?: string;
    disabled: boolean;
    role: any; // Consider defining a Role interface if structure is known and complex
    branch?: any; // Consider defining a Branch interface
}

// Login function
// The FastAPI /token endpoint expects form data (username, password)
// Content-Type: application/x-www-form-urlencoded
export const login = async (username: string, password: string): Promise<TokenResponse> => {
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);

  try {
    const response = await axios.post<TokenResponse>(`${API_BASE_URL}/token`, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(error.response.data.detail || 'Login failed');
    } else if (axios.isAxiosError(error) && error.request) {
      // The request was made but no response was received
      throw new Error('No response from server. Please try again later.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error((error as Error).message || 'An unexpected error occurred.');
    }
  }
};

// TODO: Add other auth-related functions like:
// - Get current user profile (e.g., /users/me)
// - Refresh token (if applicable)
// - Logout (client-side cleanup, potentially call a backend revoke endpoint)

// Register function
export const registerUser = async (userData: UserCreatePayload): Promise<UserResponse> => {
  try {
    const response = await axios.post<UserResponse>(`${API_BASE_URL}/users/`, userData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Extract detail message, which often contains the specific error like "Username already registered"
      throw new Error(error.response.data.detail || 'Registration failed');
    } else if (axios.isAxiosError(error) && error.request) {
      throw new Error('No response from server during registration. Please try again later.');
    } else {
      throw new Error((error as Error).message || 'An unexpected error occurred during registration.');
    }
  }
};

export default {
  login,
  registerUser,
};
