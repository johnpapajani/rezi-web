import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';

const EmailVerificationRequired: React.FC = () => {
  const { user, sendVerificationEmail, signOut, error, clearError } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleResendEmail = async () => {
    try {
      setIsLoading(true);
      clearError();
      setSuccessMessage(null);
      
      const response = await sendVerificationEmail();
      setSuccessMessage(response.message);
    } catch (err) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

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
          
          <div className="mt-6 mx-auto w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
            <EnvelopeIcon className="w-12 h-12 text-yellow-600" />
          </div>
          
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {t('auth.emailVerification.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.emailVerification.subtitle').replace('{{email}}', user?.email || '')}
          </p>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 space-y-6 bg-white rounded-xl px-8 py-8 shadow-lg border border-gray-100"
        >
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center"
            >
              <ExclamationCircleIcon className="w-5 h-5 text-red-400 mr-3" />
              <span className="text-sm text-red-700">
                {t('auth.emailVerification.resendError')}
              </span>
            </motion.div>
          )}

          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center"
            >
              <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3" />
              <span className="text-sm text-green-700">
                {successMessage}
              </span>
            </motion.div>
          )}

          <div className="text-center space-y-4">
            <p className="text-gray-600">
              {t('auth.emailVerification.instructions')}
            </p>

            <div className="space-y-3">
              {/* Resend Email Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleResendEmail}
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('auth.emailVerification.resending')}
                  </div>
                ) : (
                  t('auth.emailVerification.resendButton')
                )}
              </motion.button>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="w-full py-2 px-4 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                {t('auth.emailVerification.signOutButton')}
              </button>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                {t('auth.emailVerification.checkSpam')}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EmailVerificationRequired; 