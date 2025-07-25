import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse, SignUpData, SignInData } from '../types';
import { authApi, tokenStorage } from '../utils/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user && !!tokenStorage.getAccessToken();

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      const savedUser = tokenStorage.getUser();
      const accessToken = tokenStorage.getAccessToken();
      
      if (savedUser && accessToken) {
        setUser(savedUser);
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const handleAuthResponse = (response: AuthResponse) => {
    const userData: User = {
      id: response.user_id,
      name: response.name,
      email: response.email,
      phone: response.phone,
      locale: response.locale,
      is_active: response.is_active,
    };

    setUser(userData);
    tokenStorage.setTokens(response.access_token, response.refresh_token);
    tokenStorage.setUser(userData);
  };

  const signUp = async (data: SignUpData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authApi.signUp(data);
      handleAuthResponse(response);
    } catch (err: any) {
      // Store the full error information for proper error mapping
      const errorInfo = {
        detail: err.detail || 'Sign up failed',
        status: err.status,
        endpoint: '/auth/signup'
      };
      setError(JSON.stringify(errorInfo));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (data: SignInData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authApi.signIn(data);
      handleAuthResponse(response);
    } catch (err: any) {
      // Store the full error information for proper error mapping
      const errorInfo = {
        detail: err.detail || 'Sign in failed',
        status: err.status,
        endpoint: '/auth/login'
      };
      setError(JSON.stringify(errorInfo));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      const accessToken = tokenStorage.getAccessToken();
      
      // Call backend logout endpoint if we have tokens
      if (refreshToken && accessToken) {
        try {
          await authApi.logout(refreshToken, accessToken);
        } catch (err) {
          // Even if logout fails on the backend, we still want to clear local tokens
          console.warn('Backend logout failed, but clearing local tokens:', err);
        }
      }
    } catch (err) {
      console.warn('Error during logout:', err);
    } finally {
      // Always clear local state regardless of backend response
      setUser(null);
      tokenStorage.clearTokens();
      setError(null);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 