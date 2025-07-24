import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { useUserBusinesses } from '../../hooks/useUserBusinesses';
import MobileOptimizedHeader from '../shared/MobileOptimizedHeader';
import { 
  UserCircleIcon, 
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
  ChevronDownIcon,
  CogIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { businesses, loading: businessesLoading, error: businessesError } = useUserBusinesses();

  const handleSignOut = async () => {
    await signOut();
  };

  // Remove the auto-redirect effect - users should stay on dashboard
  // and see the option to create a business

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <MobileOptimizedHeader
        title="Rezi"
        subtitle={`${t('dashboard.welcome')}, ${user?.name}!`}
        logoUrl="/favicon.svg"
        variant="default"
        actions={[
          {
            label: t('dashboard.signOut'),
            onClick: handleSignOut,
            variant: 'secondary',
            icon: ArrowRightOnRectangleIcon
          }
        ]}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Business Loading Error */}
        {businessesError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">Error loading businesses: {businessesError}</span>
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {t('dashboard.welcome')}, {user?.name}!
            </h1>
            <p className="mt-2 text-gray-600">
              {t('dashboard.subtitle')}
            </p>
          </div>

          {/* Your Businesses */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('dashboard.yourBusinesses.title')}
              </h2>
              {!businessesLoading && businesses.length > 0 && (
                <button
                  onClick={() => navigate('/business/create')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <BuildingStorefrontIcon className="w-4 h-4 mr-2" />
                  {t('dashboard.yourBusinesses.addBusiness')}
                </button>
              )}
            </div>

            {businessesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : businesses.length === 0 ? (
              <div className="text-center py-12">
                <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">{t('dashboard.yourBusinesses.noBusinesses.title')}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t('dashboard.yourBusinesses.noBusinesses.description')}
                </p>
                <div className="mt-6 space-x-3">
                  <button
                    onClick={() => navigate('/business/create')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <BuildingStorefrontIcon className="w-4 h-4 mr-2" />
                    {t('dashboard.yourBusinesses.createBusiness')}
                  </button>
                  <Link
                    to="/guide"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {t('dashboard.needHelp')}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {businesses.map((business) => (
                  <motion.div
                    key={business.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer space-y-3 sm:space-y-0"
                    onClick={() => navigate(`/business/${business.id}`)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">
                          {business.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">{business.name}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                          <span className="capitalize">{business.role}</span>
                          {business.city && <span>• {business.city}</span>}
                          <span>• {business.currency}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/business/${business.id}/select-service`);
                        }}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium px-3 py-2 rounded-md hover:bg-purple-50 transition-colors touch-manipulation"
                      >
                        {t('dashboard.yourBusinesses.manage')}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard; 