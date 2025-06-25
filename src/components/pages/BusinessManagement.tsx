import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useBusiness } from '../../hooks/useBusiness';
import { useTranslation } from '../../hooks/useTranslation';
import { BusinessUpdate } from '../../types';
import {
  BuildingStorefrontIcon,
  PhotoIcon,
  GlobeAltIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import BusinessTabNavigation from '../shared/BusinessTabNavigation';

const BusinessManagement: React.FC = () => {
  const { bizId } = useParams<{ bizId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { business, loading, error, updating, updateBusiness } = useBusiness({ 
    bizId: bizId || '' 
  });

  const [formData, setFormData] = useState<BusinessUpdate>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'settings' | 'tables' | 'bookings' | 'calendar'>('settings');

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

  if (!bizId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('business.management.businessIdRequired')}</h2>
          <p className="text-gray-600 mb-4">{t('business.management.businessIdRequiredDesc')}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {t('business.management.error.return')}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('business.management.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('business.management.error.title')}</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {t('business.management.error.return')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('business.management.settings')}</h1>
                <p className="text-sm text-gray-600">{business?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <BuildingStorefrontIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <BusinessTabNavigation 
            bizId={bizId || ''} 
            currentTab={currentTab} 
            onTabChange={setCurrentTab} 
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Success Message */}
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3"
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
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="space-y-4">
                                 <div>
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

                                 <div>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
                             <button
                 type="button"
                 onClick={() => navigate('/dashboard')}
                 className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
               >
                 {t('business.management.cancel')}
               </button>
               <button
                 type="submit"
                 disabled={updating}
                 className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
               >
                 {updating && (
                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                 )}
                 <span>{updating ? t('business.management.updating') : t('business.management.update')}</span>
               </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default BusinessManagement; 