import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, tokenStorage } from '../utils/api';
import { User, SignUpData, SignInData, AuthResponse, VerifyEmailRequest, VerifyEmailResponse, ForgotPasswordRequest, ForgotPasswordResponse, ResetPasswordRequest, ResetPasswordResponse } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  verifyEmail: (data: VerifyEmailRequest) => Promise<VerifyEmailResponse>;
  forgotPassword: (data: ForgotPasswordRequest) => Promise<ForgotPasswordResponse>;
  resetPassword: (data: ResetPasswordRequest) => Promise<ResetPasswordResponse>;
  error: string | null;
  clearError: () => void;
  refreshUserAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Enhanced authentication check
  const isAuthenticated = !!user && tokenStorage.isAccessTokenValid();

  // Auto-authentication function
  const refreshUserAuth = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Check if we have valid tokens
      if (tokenStorage.isAccessTokenValid()) {
        // Access token is valid, restore user from storage
        const savedUser = tokenStorage.getUser();
        if (savedUser) {
          setUser(savedUser);
          return;
        }
      }

      // If access token is expired but refresh token is valid, try to refresh
      if (tokenStorage.isRefreshTokenValid()) {
        const refreshToken = tokenStorage.getRefreshToken();
        if (refreshToken) {
          try {
            const refreshResponse = await authApi.refreshToken(refreshToken);
            
            // Update tokens
            tokenStorage.setTokens(refreshResponse.access_token, refreshResponse.refresh_token);
            
            // Restore user from storage
            const savedUser = tokenStorage.getUser();
            if (savedUser) {
              setUser(savedUser);
              return;
            }
          } catch (refreshError) {
            console.warn('Token refresh failed during initialization:', refreshError);
            // Continue to clear tokens below
          }
        }
      }

      // If we get here, tokens are invalid or missing
      tokenStorage.clearTokens();
      setUser(null);
    } catch (err) {
      console.error('Auto-authentication failed:', err);
      tokenStorage.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    refreshUserAuth();
  }, []);

  // Listen for token expiration events
  useEffect(() => {
    const handleTokenExpired = () => {
      console.log('Token expired event received, logging out user');
      setUser(null);
      tokenStorage.clearTokens();
      setError('Your session has expired. Please log in again.');
    };

    window.addEventListener('auth:token-expired', handleTokenExpired);
    return () => {
      window.removeEventListener('auth:token-expired', handleTokenExpired);
    };
  }, []);

  const handleAuthResponse = (response: AuthResponse) => {
    const userData: User = {
      id: response.user_id,
      name: response.name,
      email: response.email,
      phone: response.phone,
      locale: response.locale,
      is_active: response.is_active,
      email_verified: response.email_verified,
      subscription_tier: response.subscription_tier,
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

  const sendVerificationEmail = async (): Promise<void> => {
    try {
      setError(null);
      await authApi.sendVerificationEmail();
    } catch (err: any) {
      const errorInfo = {
        detail: err.detail || 'Failed to send verification email',
        status: err.status,
        endpoint: '/auth/send-verification-email'
      };
      setError(JSON.stringify(errorInfo));
      throw err;
    }
  };

  const verifyEmail = async (data: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
    try {
      setError(null);
      return await authApi.verifyEmail(data);
    } catch (err: any) {
      const errorInfo = {
        detail: err.detail || 'Email verification failed',
        status: err.status,
        endpoint: '/auth/verify-email'
      };
      setError(JSON.stringify(errorInfo));
      throw err;
    }
  };

  const forgotPassword = async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    try {
      setError(null);
      return await authApi.forgotPassword(data);
    } catch (err: any) {
      const errorInfo = {
        detail: err.detail || 'Failed to send password reset email',
        status: err.status,
        endpoint: '/auth/forgot-password'
      };
      setError(JSON.stringify(errorInfo));
      throw err;
    }
  };

  const resetPassword = async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    try {
      setError(null);
      return await authApi.resetPassword(data);
    } catch (err: any) {
      const errorInfo = {
        detail: err.detail || 'Password reset failed',
        status: err.status,
        endpoint: '/auth/reset-password'
      };
      setError(JSON.stringify(errorInfo));
      throw err;
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
    sendVerificationEmail,
    verifyEmail,
    forgotPassword,
    resetPassword,
    error,
    clearError,
    refreshUserAuth,
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