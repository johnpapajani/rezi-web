import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import EmailVerificationRequired from './EmailVerificationRequired';

interface EmailVerifiedRouteProps {
  children: React.ReactNode;
}

const EmailVerifiedRoute: React.FC<EmailVerifiedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Check if email is verified
  if (user && user.email_verified === false) {
    return <EmailVerificationRequired />;
  }

  return <>{children}</>;
};

export default EmailVerifiedRoute; 