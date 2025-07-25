/**
 * Maps server error messages to translation keys for proper localization
 */
export const mapAuthErrorToTranslationKey = (error: string): string => {
  // Convert error to lowercase for case-insensitive matching
  const errorLower = error.toLowerCase();
  
  // Direct mappings for exact Albanian error messages
  if (errorLower === 'ky email tashmë është regjistruar.' || errorLower === 'ky email tashmë është regjistruar') {
    return 'auth.errors.emailAlreadyExists';
  }
  
  // Common server error patterns to translation keys
  // Handle both English and Albanian error messages for email already exists
  if (errorLower.includes('email') && (
    errorLower.includes('already') || 
    errorLower.includes('exists') || 
    errorLower.includes('taken') ||
    errorLower.includes('tashmë') || 
    errorLower.includes('regjistruar')
  )) {
    return 'auth.errors.emailAlreadyExists';
  }
  
  if (errorLower.includes('invalid') && (errorLower.includes('credentials') || errorLower.includes('password') || errorLower.includes('email')) ||
      (errorLower.includes('fjalëkalimi') && errorLower.includes('gabuar')) ||
      (errorLower.includes('email') && errorLower.includes('gabuar'))) {
    return 'auth.errors.invalidCredentials';
  }
  
  if ((errorLower.includes('user') && errorLower.includes('not found')) ||
      (errorLower.includes('përdoruesi') && errorLower.includes('nuk u gjet'))) {
    return 'auth.errors.userNotFound';
  }
  
  if ((errorLower.includes('account') && (errorLower.includes('disabled') || errorLower.includes('inactive'))) ||
      (errorLower.includes('llogaria') && errorLower.includes('çaktivizuar'))) {
    return 'auth.errors.accountDisabled';
  }
  
  if (errorLower.includes('network') || errorLower.includes('connection')) {
    return 'auth.errors.networkError';
  }
  
  if (errorLower.includes('server') || errorLower.includes('internal')) {
    return 'auth.errors.serverError';
  }
  
  if (errorLower.includes('session') && errorLower.includes('expired')) {
    return 'auth.errors.sessionExpired';
  }
  
  if (errorLower.includes('too many') || errorLower.includes('rate limit')) {
    return 'auth.errors.tooManyAttempts';
  }
  
  if (error === 'Sign up failed') {
    return 'auth.errors.signUpFailed';
  }
  
  if (error === 'Sign in failed') {
    return 'auth.errors.signInFailed';
  }
  
  // If no specific mapping found, return the original error
  // This allows for custom server messages to still be displayed
  return error;
}; 