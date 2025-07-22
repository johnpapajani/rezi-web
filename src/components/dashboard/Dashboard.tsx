import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { useUserBusinesses } from '../../hooks/useUserBusinesses';
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
  const { t, currentLanguage, setLanguage, languages } = useTranslation();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
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
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Rezi
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <GlobeAltIcon className="w-5 h-5" />
                  <span className="text-sm">
                    {languages.find(lang => lang.code === currentLanguage)?.flag}
                  </span>
                  <ChevronDownIcon className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {isLanguageOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                    >
                      {languages.map((language) => (
                        <button
                          key={language.code}
                          onClick={() => {
                            setLanguage(language.code);
                            setIsLanguageOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 ${
                            currentLanguage === language.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                          }`}
                        >
                          <span>{language.flag}</span>
                          <span>{language.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center space-x-2">
                <UserCircleIcon className="w-6 h-6 text-gray-400" />
                <span className="text-sm text-gray-700">{user?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span className="text-sm">{t('dashboard.signOut')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

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
              {t('dashboard.welcome')}, {user?.email}!
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
                <div className="mt-6">
                  <button
                    onClick={() => navigate('/business/create')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <BuildingStorefrontIcon className="w-4 h-4 mr-2" />
                    {t('dashboard.yourBusinesses.createBusiness')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {businesses.map((business) => (
                  <motion.div
                    key={business.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                    onClick={() => navigate(`/business/${business.id}`)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {business.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{business.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="capitalize">{business.role}</span>
                          {business.city && <span>• {business.city}</span>}
                          <span>• {business.currency}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/business/${business.id}/select-service`);
                        }}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium"
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