"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '@/services/authService';
import { User } from '@/types/user'; // Import the new User type
import axios from 'axios'; // For /users/me call

// Helper to get API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';


interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<User>; // Return User on successful login
  logout: () => void;
  loading: boolean; // For initial auth check or during login
  authError: string | null; // Store auth related errors
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true for initial check
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        try {
          // Validate token by fetching user profile
          const response = await axios.get<User>(`${API_BASE_URL}/users/me/`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          setUser(response.data);
          localStorage.setItem('authUser', JSON.stringify(response.data)); // Update stored user
        } catch (error) {
          console.error("Failed to fetch user with stored token or token invalid:", error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    setLoading(true);
    setAuthError(null);
    try {
      const tokenData = await authService.login(username, password);
      setToken(tokenData.access_token);
      localStorage.setItem('authToken', tokenData.access_token);

      // After successful login, fetch user details
      const userResponse = await axios.get<User>(`${API_BASE_URL}/users/me/`, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      setUser(userResponse.data);
      localStorage.setItem('authUser', JSON.stringify(userResponse.data));
      return userResponse.data; // Return user data
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Login failed.';
      setAuthError(errorMessage);
      localStorage.removeItem('authToken'); // Clear token on failed login/fetch
      localStorage.removeItem('authUser');
      setToken(null);
      setUser(null);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    // TODO: Redirect to login or home page
    // router.push('/login'); // If using next/navigation router
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, user, token, login, logout, loading, authError }}>
      {children}
    </AuthContext.Provider>
  );
};
