import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'; // Fallback if not set

interface TokenResponse {
  access_token: string;
  token_type: string;
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

export default {
  login,
};
