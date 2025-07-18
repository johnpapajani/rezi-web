import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { useServices } from '../../hooks/useServices';
import { useBusiness } from '../../hooks/useBusiness';
import { 
  UserCircleIcon, 
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
  ChevronDownIcon,
  CogIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EyeIcon,
  EyeSlashIcon,
  RectangleGroupIcon,
  ArrowRightIcon,
  PlusIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const ServiceDashboard: React.FC = () => {
  const { bizId } = useParams<{ bizId: string }>();
  const { user, signOut } = useAuth();
  const { t, currentLanguage, setLanguage, languages } = useTranslation();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const navigate = useNavigate();
  const { business, loading: businessLoading, error: businessError } = useBusiness({ bizId: bizId || '' });
  const { services, loading: servicesLoading, error: servicesError } = useServices({ bizId: bizId || '', activeOnly: false });

  const handleSignOut = async () => {
    await signOut();
  };

  const formatPrice = (priceMinor: number, currency: string = 'ALL'): string => {
    const price = priceMinor / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    navigate(`/service/${serviceId}`);
  };

  const handleCreateService = () => {
    navigate(`/business/${bizId}/services`);
  };

  const activeServices = services.filter(service => service.is_active);
  const inactiveServices = services.filter(service => !service.is_active);

  if (businessLoading || servicesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('serviceDashboard.loadingServices')}</p>
        </div>
      </div>
    );
  }

  if (businessError || servicesError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('serviceDashboard.errorLoadingServices')}</h2>
          <p className="text-red-600 mb-4">{businessError || servicesError}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {t('serviceDashboard.returnToDashboard')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center">
                {business?.logo_url ? (
                  <img
                    src={business.logo_url}
                    alt={business.name}
                    className="w-8 h-8 rounded-lg object-cover mr-3"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <BuildingStorefrontIcon className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {business?.name} {t('serviceDashboard.title')}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {t('serviceDashboard.subtitle')}
                  </p>
                </div>
              </div>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Business Services */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('serviceDashboard.availableServices')}
              </h2>
              <button
                onClick={handleCreateService}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                {t('serviceDashboard.addService')}
              </button>
            </div>

            {services.length === 0 ? (
              <div className="text-center py-12">
                <BuildingStorefrontIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('serviceDashboard.noServicesYet')}</h3>
                <p className="text-gray-600 mb-6">{t('serviceDashboard.noServicesDescription')}</p>
                <button
                  onClick={handleCreateService}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  {t('serviceDashboard.createFirstService')}
                </button>
              </div>
            ) : (
              <div>
                {/* Active Services */}
                {activeServices.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{t('serviceDashboard.activeServices')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activeServices.map((service, index) => (
                        <motion.div
                          key={service.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                          onClick={() => handleServiceSelect(service.id)}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {service.name}
                            </h4>
                            <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                          </div>

                          {service.description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                          )}

                          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                            <div className="flex items-center space-x-2">
                              <ClockIcon className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{formatDuration(service.duration_minutes)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                {service.price_minor > 0 ? formatPrice(service.price_minor, business?.currency) : t('common.free')}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RectangleGroupIcon className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{service.table_count || 0} {t('services.tables')}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{t('serviceDashboard.recentBookings')}</span>
                            </div>
                          </div>

                          <div className="border-t border-gray-100 pt-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <EyeIcon className="w-3 h-3 mr-1" />
                              {t('common.active')}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inactive Services */}
                {inactiveServices.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{t('serviceDashboard.inactiveServices')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {inactiveServices.map((service, index) => (
                        <motion.div
                          key={service.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-6 opacity-75 hover:opacity-100 hover:border-gray-300 transition-all cursor-pointer"
                          onClick={() => handleServiceSelect(service.id)}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-medium text-gray-700">
                              {service.name}
                            </h4>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <EyeSlashIcon className="w-3 h-3 mr-1" />
                              {t('common.inactive')}
                            </span>
                          </div>

                          <div className="border-t border-gray-200 pt-4">
                            <p className="text-sm text-gray-500">{t('serviceDashboard.clickToManage')}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default ServiceDashboard; 