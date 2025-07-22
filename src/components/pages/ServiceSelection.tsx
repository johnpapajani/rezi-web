import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { useServices } from '../../hooks/useServices';
import { useBusiness } from '../../hooks/useBusiness';
import { 
  ArrowLeftIcon,
  CogIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';

const ServiceSelection: React.FC = () => {
  const { bizId } = useParams<{ bizId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { business, loading: businessLoading } = useBusiness({ bizId: bizId! });
  const { 
    services, 
    loading: servicesLoading, 
    error: servicesError 
  } = useServices({ bizId: bizId!, activeOnly: false }); // Show all services including inactive

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
    // Navigate to the business dashboard with service context
    navigate(`/business/${bizId}?service=${serviceId}`);
  };

  const handleManageAllServices = () => {
    // Navigate directly to the services tab
    navigate(`/business/${bizId}/services`);
  };

  if (businessLoading || servicesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('services.loading')}</p>
        </div>
      </div>
    );
  }

  if (servicesError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('services.error.title')}</h2>
          <p className="text-red-600 mb-4">{servicesError}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {t('services.error.return')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-0 sm:h-16 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-4 min-w-0">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3 min-w-0">
                {business?.logo_url ? (
                  <img
                    src={business.logo_url}
                    alt={business.name}
                    className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BuildingStorefrontIcon className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                    {t('serviceSelection.title')}
                  </h1>
                  <p className="text-sm text-gray-600 truncate">{business?.name}</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleManageAllServices}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <CogIcon className="w-4 h-4 mr-2" />
              {t('serviceSelection.manageAll')}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Instructions */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('serviceSelection.subtitle')}
            </h2>
            <p className="text-gray-600">
              {t('serviceSelection.description')}
            </p>
          </div>

          {/* Services Grid */}
          {services.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">{t('services.noServices.title')}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('services.noServices.description')}
              </p>
              <div className="mt-6">
                <button
                  onClick={handleManageAllServices}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <CogIcon className="w-4 h-4 mr-2" />
                  {t('services.addService')}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:border-blue-300 transition-colors cursor-pointer group"
                  onClick={() => handleServiceSelect(service.id)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {service.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {service.is_active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <EyeIcon className="w-3 h-3 mr-1" />
                            {t('services.active')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <EyeSlashIcon className="w-3 h-3 mr-1" />
                            {t('services.inactive')}
                          </span>
                        )}
                        <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>

                    {service.description && (
                      <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{formatDuration(service.duration_min)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {service.price_minor > 0 
                            ? formatPrice(service.price_minor, business?.currency) 
                            : t('services.free')
                          }
                        </span>
                      </div>
                    </div>

                    {service.table_count > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span className="font-medium">{service.table_count}</span>
                          <span>
                            {service.table_count === 1 ? t('services.table') : t('services.tables')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default ServiceSelection; 