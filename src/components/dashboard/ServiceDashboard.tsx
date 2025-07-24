import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { useServices } from '../../hooks/useServices';
import { useBusiness } from '../../hooks/useBusiness';
import { BusinessUpdate } from '../../types';
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
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EyeIcon,
  EyeSlashIcon,
  RectangleGroupIcon,
  ArrowRightIcon,
  PlusIcon,
  ArrowLeftIcon,
  PhotoIcon,
  MapPinIcon,
  CheckCircleIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';

type TabType = 'services' | 'settings' | 'qrcode';

const ServiceDashboard: React.FC = () => {
  const { bizId } = useParams<{ bizId: string }>();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState<TabType>('services');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on QR page for highlighting tab
  useEffect(() => {
    if (location.pathname.includes('/qr')) {
      setCurrentTab('qrcode');
    }
  }, [location.pathname]);
  const { business, loading: businessLoading, error: businessError, updating, updateBusiness } = useBusiness({ bizId: bizId || '' });
  const { services, loading: servicesLoading, error: servicesError } = useServices({ bizId: bizId || '', activeOnly: false });

  // Business Settings form state
  const [formData, setFormData] = useState<BusinessUpdate>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Populate form when business data loads
  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name,
        logo_url: business.logo_url || '',
        currency: business.currency,
        timezone: business.timezone,
        address_line1: business.address_line1 || '',
        address_line2: business.address_line2 || '',
        city: business.city || '',
        postal_code: business.postal_code || '',
      });
    }
  }, [business]);

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
    navigate(`/business/${bizId}/services?create=true`);
  };

  // Business Settings handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      // Only send changed fields
      const updates: BusinessUpdate = {};
      Object.keys(formData).forEach(key => {
        const formKey = key as keyof BusinessUpdate;
        const businessKey = key as keyof typeof business;
        if (business && formData[formKey] !== business[businessKey]) {
          (updates as any)[formKey] = formData[formKey];
        }
      });

      if (Object.keys(updates).length === 0) {
        setFormError(t('business.management.noChanges'));
        return;
      }

      await updateBusiness(updates);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      setFormError(error.detail || t('business.management.error.title'));
    }
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

  const renderServicesTab = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
    >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {t('serviceDashboard.availableServices')}
        </h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => window.open(`/book/${business?.slug}`, '_blank')}
            className="inline-flex items-center justify-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 touch-manipulation"
          >
            <GlobeAltIcon className="w-4 h-4 mr-2" />
            {t('serviceManagement.viewPublicPage')}
          </button>
          <button
            onClick={handleCreateService}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 touch-manipulation"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            {t('serviceDashboard.addService')}
          </button>
        </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm mb-4">
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{formatDuration(service.duration_min)}</span>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
  );

  const renderSettingsTab = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="space-y-8"
    >
      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3"
        >
          <CheckCircleIcon className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">{t('business.management.success')}</span>
        </motion.div>
      )}

      {/* Error Message */}
      {formError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3"
        >
          <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
          <span className="text-red-800 font-medium">{formError}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <BuildingStorefrontIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">{t('business.sections.basic.title')}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                {t('business.fields.name.required')}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-2">
                <PhotoIcon className="w-4 h-4 inline mr-1" />
                {t('business.fields.logoUrl')}
              </label>
              <input
                type="url"
                id="logo_url"
                name="logo_url"
                value={formData.logo_url || ''}
                onChange={handleInputChange}
                placeholder={t('business.fields.logoUrl.placeholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <GlobeAltIcon className="w-6 h-6 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">{t('business.sections.regional.title')}</h2>
          </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
                {t('business.fields.currency')}
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency || 'ALL'}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">Albanian Lek (ALL)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="GBP">British Pound (GBP)</option>
              </select>
            </div>

            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                <ClockIcon className="w-4 h-4 inline mr-1" />
                {t('business.fields.timezone')}
              </label>
              <select
                id="timezone"
                name="timezone"
                value={formData.timezone || 'Europe/Tirane'}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Europe/Tirane">Europe/Tirane</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Europe/Paris">Europe/Paris</option>
                <option value="Europe/Berlin">Europe/Berlin</option>
                <option value="Europe/Rome">Europe/Rome</option>
                <option value="America/New_York">America/New_York</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
              </select>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <MapPinIcon className="w-6 h-6 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">{t('business.sections.address.title')}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700 mb-2">
                {t('business.fields.addressLine1')}
              </label>
              <input
                type="text"
                id="address_line1"
                name="address_line1"
                value={formData.address_line1 || ''}
                onChange={handleInputChange}
                placeholder={t('business.fields.addressLine1.placeholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address_line2" className="block text-sm font-medium text-gray-700 mb-2">
                {t('business.fields.addressLine2')}
              </label>
              <input
                type="text"
                id="address_line2"
                name="address_line2"
                value={formData.address_line2 || ''}
                onChange={handleInputChange}
                placeholder={t('business.fields.addressLine2.placeholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                {t('business.fields.city')}
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city || ''}
                onChange={handleInputChange}
                placeholder={t('business.fields.city.placeholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-2">
                {t('business.fields.postalCode')}
              </label>
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                value={formData.postal_code || ''}
                onChange={handleInputChange}
                placeholder={t('business.fields.postalCode.placeholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updating}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t('business.management.saving')}
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                {t('business.management.save')}
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <MobileOptimizedHeader
        title={business?.name || ''}
        subtitle={currentTab === 'services' ? t('serviceDashboard.subtitle') : t('business.management.settings')}
        backUrl="/dashboard"
        logoUrl={business?.logo_url}
        icon={!business?.logo_url ? BuildingStorefrontIcon : undefined}
        variant="business"
        tabs={[
          {
            id: 'services',
            label: t('business.dashboard.tabs.services'),
            isActive: currentTab === 'services',
            onClick: () => setCurrentTab('services')
          },
          {
            id: 'settings',
            label: t('business.dashboard.tabs.settings'),
            isActive: currentTab === 'settings',
            onClick: () => setCurrentTab('settings')
          },
          {
            id: 'qrcode',
            label: t('business.qr.title'),
            isActive: currentTab === 'qrcode',
            onClick: () => navigate(`/business/${bizId}/qr`)
          }
        ]}
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {currentTab === 'services' && renderServicesTab()}
          {currentTab === 'settings' && renderSettingsTab()}
        </motion.div>
      </main>
    </div>
  );
};

export default ServiceDashboard; 