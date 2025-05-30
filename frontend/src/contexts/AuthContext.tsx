"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '@/services/authService'; // Assuming @ is src

// Define the shape of the user object (adjust as per your backend's User model)
interface User {
  username: string;
  // email?: string;
  // fullName?: string;
  // roles?: string[]; // Example for future use
  // disabled?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
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
    // Check for token in localStorage on initial load
    const storedToken = localStorage.getItem('authToken');
    const storedUserString = localStorage.getItem('authUser');
    if (storedToken) {
      setToken(storedToken);
      if (storedUserString) {
        try {
          setUser(JSON.parse(storedUserString));
        } catch (e) {
          console.error("Failed to parse stored user", e);
          localStorage.removeItem('authUser'); // Clear corrupted user data
        }
      }
      // TODO: Optionally validate token with backend here (e.g., fetch /users/me)
      // For now, we assume if token is present, it's valid.
      // If you fetch /users/me, update user state with that data.
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const data = await authService.login(username, password);
      setToken(data.access_token);
      localStorage.setItem('authToken', data.access_token);

      // For now, just set username. Ideally, fetch /users/me to get full user details
      const currentUser: User = { username };
      setUser(currentUser);
      localStorage.setItem('authUser', JSON.stringify(currentUser));

    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      setAuthError(errorMessage);
      throw new Error(errorMessage); // Re-throw to be caught by form
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
