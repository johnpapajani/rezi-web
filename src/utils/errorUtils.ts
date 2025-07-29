/**
 * Maps API errors to translation keys based on HTTP status codes and endpoint context
 * This is much more robust than parsing localized error messages
 */

export interface ApiErrorInfo {
  detail: string;
  status?: number;
  endpoint?: string;
}

/**
 * Maps authentication errors to translation keys based on status codes and context
 */
export const mapAuthErrorToTranslationKey = (errorInfo: ApiErrorInfo): string => {
  const { status, endpoint, detail } = errorInfo;
  
  // Map by HTTP status code and endpoint - much more reliable than text parsing
  if (status) {
    switch (status) {
      case 400:
        // Bad Request - usually validation errors or business logic errors
        if (endpoint?.includes('/auth/signup')) {
          // For signup, 400 typically means email already exists or validation error
          if (detail.toLowerCase().includes('email')) {
            return 'auth.errors.emailAlreadyExists';
          }
          return 'auth.errors.signUpFailed';
        }
        if (endpoint?.includes('/auth/login')) {
          // For login, 400 typically means invalid credentials
          return 'auth.errors.invalidCredentials';
        }
        if (endpoint?.includes('/auth/reset-password')) {
          // For password reset, 400 can mean various things
          const detailLower = detail.toLowerCase();
          if (detailLower.includes('skaduar') || detailLower.includes('expired')) {
            return 'auth.resetPassword.tokenExpired';
          }
          if (detailLower.includes('pavlefshëm') || detailLower.includes('invalid')) {
            return 'auth.resetPassword.tokenInvalid';
          }
          if (detailLower.includes('password') || detailLower.includes('fjalëkalim')) {
            return 'auth.errors.passwordTooShort';
          }
          if (detailLower.includes('user') || detailLower.includes('përdorues')) {
            return 'auth.errors.userNotFound';
          }
          // Generic password reset error
          return 'auth.resetPassword.tokenInvalid';
        }
        if (endpoint?.includes('/auth/forgot-password')) {
          // For forgot password, 400 typically means validation error
          return 'auth.errors.emailInvalid';
        }
        return 'auth.errors.invalidCredentials';
        
      case 401:
        // Unauthorized - invalid credentials or expired session
        if (endpoint?.includes('/auth/login')) {
          return 'auth.errors.invalidCredentials';
        }
        return 'auth.errors.sessionExpired';
        
      case 403:
        // Forbidden - account disabled or insufficient permissions
        return 'auth.errors.accountDisabled';
        
      case 404:
        // Not Found - user doesn't exist
        return 'auth.errors.userNotFound';
        
      case 409:
        // Conflict - resource already exists (email already registered)
        return 'auth.errors.emailAlreadyExists';
        
      case 422:
        // Unprocessable Entity - validation errors
        if (endpoint?.includes('/auth/signup')) {
          // Try to determine specific validation error
          const detailLower = detail.toLowerCase();
          if (detailLower.includes('email')) {
            return 'auth.errors.emailInvalid';
          }
          if (detailLower.includes('password')) {
            return 'auth.errors.passwordTooShort';
          }
          return 'auth.errors.signUpFailed';
        }
        return 'auth.errors.invalidCredentials';
        
      case 429:
        // Too Many Requests - rate limiting
        return 'auth.errors.tooManyAttempts';
        
      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors
        return 'auth.errors.serverError';
        
      default:
        // Unknown status code
        break;
    }
  }
  
  // Fallback: Check for network errors (no status code)
  if (!status) {
    if (detail.toLowerCase().includes('network') || 
        detail.toLowerCase().includes('connection') ||
        detail.toLowerCase().includes('fetch')) {
      return 'auth.errors.networkError';
    }
  }
  
  // Final fallback for generic auth errors
  if (endpoint?.includes('/auth/signup')) {
    return 'auth.errors.signUpFailed';
  }
  if (endpoint?.includes('/auth/login')) {
    return 'auth.errors.signInFailed';
  }
  if (endpoint?.includes('/auth/reset-password')) {
    return 'auth.resetPassword.tokenInvalid';
  }
  if (endpoint?.includes('/auth/forgot-password')) {
    return 'auth.errors.emailInvalid';
  }
  
  // If all else fails, return a generic error key
  // The translation system will fall back to displaying the original detail
  return 'auth.errors.serverError';
};

/**
 * Helper function for backward compatibility with simple string errors
 */
export const mapSimpleAuthError = (error: string): string => {
  return mapAuthErrorToTranslationKey({ 
    detail: error,
    status: undefined,
    endpoint: undefined 
  });
}; 