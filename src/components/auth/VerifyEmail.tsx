import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';

const VerifyEmail: React.FC = () => {
  const { verifyEmail, error, clearError, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setVerificationError(t('auth.emailVerification.invalidToken'));
      setIsLoading(false);
      return;
    }

    const handleVerification = async () => {
      try {
        clearError();
        await verifyEmail({ token });
        setIsVerified(true);
        
        // Redirect to dashboard after successful verification if user is authenticated
        setTimeout(() => {
          if (isAuthenticated) {
            navigate('/dashboard');
          } else {
            navigate('/signin');
          }
        }, 3000);
      } catch (err) {
        setVerificationError(t('auth.emailVerification.verificationFailed'));
      } finally {
        setIsLoading(false);
      }
    };

    handleVerification();
  }, [searchParams, verifyEmail, clearError, navigate, isAuthenticated, t]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('auth.emailVerification.verifying')}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">R</span>
            </div>
            <span className="ml-3 text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Rezi
            </span>
          </Link>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 space-y-6 bg-white rounded-xl px-8 py-8 shadow-lg border border-gray-100"
        >
          {isVerified ? (
            // Success State
            <div className="text-center space-y-4">
              <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-12 h-12 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900">
                {t('auth.emailVerification.successTitle')}
              </h2>
              
              <p className="text-gray-600">
                {t('auth.emailVerification.successMessage')}
              </p>

              <div className="pt-4">
                <p className="text-sm text-gray-500">
                  {isAuthenticated 
                    ? t('auth.emailVerification.redirectingToDashboard')
                    : t('auth.emailVerification.redirectingToSignIn')
                  }
                </p>
              </div>
            </div>
          ) : (
            // Error State
            <div className="text-center space-y-4">
              <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationCircleIcon className="w-12 h-12 text-red-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900">
                {t('auth.emailVerification.errorTitle')}
              </h2>
              
              <p className="text-gray-600">
                {verificationError || error || t('auth.emailVerification.genericError')}
              </p>

              <div className="space-y-3 pt-4">
                <Link
                  to="/verify-email-required"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  {t('auth.emailVerification.requestNewLink')}
                </Link>
                
                <div className="flex justify-center">
                  <Link
                    to="/"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-1" />
                    {t('auth.emailVerification.backToHome')}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail; 