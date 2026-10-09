'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import {
  loginUser,
  registerUser,
  verifyEmailOtp,
  resendVerificationOtp,
  getAuthMe,
  updateUserProfile,
} from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<{ requiresVerification?: boolean; email?: string; message: string }>;
  verifyOtp: (payload: { email: string; otp: string }) => Promise<void>;
  resendOtp: (email: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (payload: {
    name?: string;
    phone?: string;
    addresses?: any[];
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'sportxwear_token';
const USER_KEY = 'sportxwear_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from localStorage and verify with backend
  useEffect(() => {
    async function initAuth() {
      try {
        if (typeof window !== 'undefined') {
          const storedToken = localStorage.getItem(TOKEN_KEY);
          const storedUser = localStorage.getItem(USER_KEY);

          if (storedToken) {
            setToken(storedToken);
            if (storedUser) {
              try {
                setUser(JSON.parse(storedUser));
              } catch (e) {
                console.error('Error parsing stored user:', e);
              }
            }

            // Verify and refresh with backend
            try {
              const res = await getAuthMe(storedToken);
              if (res.success && res.user) {
                setUser(res.user);
                localStorage.setItem(USER_KEY, JSON.stringify(res.user));
              }
            } catch (err) {
              console.warn('Session expired or invalid token. Logging out.');
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(USER_KEY);
              setToken(null);
              setUser(null);
            }
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await loginUser(credentials);
      if (res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem(TOKEN_KEY, res.token);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await registerUser(payload);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (payload: { email: string; otp: string }) => {
    setIsLoading(true);
    try {
      const res = await verifyEmailOtp(payload);
      if (res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem(TOKEN_KEY, res.token);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email: string) => {
    return await resendVerificationOtp({ email });
  };


  const updateProfile = async (payload: {
    name?: string;
    phone?: string;
    addresses?: any[];
  }) => {
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    try {
      const res = await updateUserProfile(token, payload);
      if (res.success && res.user) {
        setUser(res.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        verifyOtp,
        resendOtp,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
