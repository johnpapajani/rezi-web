import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useBusinessCreate } from '../../hooks/useBusinessCreate';
import { useTranslation } from '../../hooks/useTranslation';
import { BusinessCreate } from '../../types';
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
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

const BusinessCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { creating, error, createBusiness, clearError } = useBusinessCreate();

  const [formData, setFormData] = useState<BusinessCreate>({
    name: '',
    slug: '',
    currency: 'ALL',
    timezone: 'Europe/Tirane',
    logo_url: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    country_code: 'AL',
  });

  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Generate slug from business name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      errors.name = t('business.create.validation.nameRequired');
    }

    if (!formData.slug.trim()) {
      errors.slug = t('business.create.validation.slugRequired');
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = t('business.create.validation.slugInvalid');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate slug from name
    if (name === 'name') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear API error when user makes changes
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Remove empty optional fields
      const cleanData: BusinessCreate = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        currency: formData.currency,
        timezone: formData.timezone,
        country_code: formData.country_code,
      };

      // Add optional fields only if they have values
      if (formData.logo_url?.trim()) {
        cleanData.logo_url = formData.logo_url.trim();
      }
      if (formData.address_line1?.trim()) {
        cleanData.address_line1 = formData.address_line1.trim();
      }
      if (formData.address_line2?.trim()) {
        cleanData.address_line2 = formData.address_line2.trim();
      }
      if (formData.city?.trim()) {
        cleanData.city = formData.city.trim();
      }
      if (formData.postal_code?.trim()) {
        cleanData.postal_code = formData.postal_code.trim();
      }

      const newBusiness = await createBusiness(cleanData);
      
      setShowSuccess(true);
      
      // Redirect to the new business management page after a short delay
      setTimeout(() => {
        navigate(`/business/${newBusiness.id}`);
      }, 1500);

    } catch (error: any) {
      // Error is handled by the hook
      console.error('Failed to create business:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/businesses')}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('business.create.title')}</h1>
                <p className="text-sm text-gray-600">{t('business.create.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <BuildingStorefrontIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
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
              <span className="text-green-800 font-medium">{t('business.create.success')}</span>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3"
            >
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">
                {error.includes('Slug already taken') ? t('business.create.error.slugTaken') :
                 error.includes('Slug cannot be empty') ? t('business.create.error.slugEmpty') :
                 error}
              </span>
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
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {validationErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('business.create.fields.slug')}
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder={t('business.create.fields.slug.placeholder')}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.slug ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  <div className="mt-1 flex items-center space-x-1 text-xs text-gray-500">
                    <InformationCircleIcon className="w-3 h-3" />
                    <span>{t('business.create.fields.slug.help')}</span>
                  </div>
                  {validationErrors.slug && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.slug}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-2">
                    <PhotoIcon className="w-4 h-4 inline mr-1" />
                    {t('business.fields.logoUrl')}
                  </label>
                  <input
                    type="url"
                    id="logo_url"
                    name="logo_url"
                    value={formData.logo_url}
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                    <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
                    {t('business.fields.currency')}
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
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
                    value={formData.timezone}
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

                <div>
                  <label htmlFor="country_code" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('business.create.fields.countryCode')}
                  </label>
                  <select
                    id="country_code"
                    name="country_code"
                    value={formData.country_code}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="AL">Albania (AL)</option>
                    <option value="US">United States (US)</option>
                    <option value="GB">United Kingdom (GB)</option>
                    <option value="DE">Germany (DE)</option>
                    <option value="FR">France (FR)</option>
                    <option value="IT">Italy (IT)</option>
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
                    value={formData.address_line1}
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
                    value={formData.address_line2}
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
                      value={formData.city}
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
                      value={formData.postal_code}
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
                onClick={() => navigate('/businesses')}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={creating}
              >
                {t('business.create.cancel')}
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {creating && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{creating ? t('business.create.creating') : t('business.create.create')}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default BusinessCreatePage; 