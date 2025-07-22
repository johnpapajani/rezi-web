import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  TagIcon,
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';
import { ServiceWithOpenIntervals, ServiceUpdate } from '../../types';

interface ServiceSettingsSectionProps {
  service: ServiceWithOpenIntervals;
  onUpdateService: (updates: ServiceUpdate) => Promise<void>;
  updating: boolean;
}

const ServiceSettingsSection: React.FC<ServiceSettingsSectionProps> = ({
  service,
  onUpdateService,
  updating,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ServiceUpdate>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Populate form when service data loads
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        slug: service.slug,
        description: service.description || '',
        duration_min: service.duration_min,
        price_minor: service.price_minor,
        is_active: service.is_active,
        category_id: service.category_id || '',
        capacity: service.capacity || undefined,
      });
    }
  }, [service]);

  // Check for changes
  useEffect(() => {
    if (!service) return;

    const hasFieldChanges = Object.keys(formData).some(key => {
      const formKey = key as keyof ServiceUpdate;
      const serviceKey = key as keyof ServiceWithOpenIntervals;
      
      // Handle optional fields that might be undefined
      const formValue = formData[formKey];
      const serviceValue = service[serviceKey];
      
      if (formKey === 'description') {
        return (formValue || '') !== (serviceValue || '');
      }
      if (formKey === 'category_id') {
        return (formValue || '') !== (serviceValue || '');
      }
      
      return formValue !== serviceValue;
    });

    setHasChanges(hasFieldChanges);
  }, [formData, service]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : Number(value)) :
              type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              value
    }));
  };

  // Generate slug from service name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData(prev => ({
      ...prev,
      name: newName,
      slug: generateSlug(newName)
    }));
  };

  const formatPrice = (priceMinor: number): string => {
    const price = priceMinor / 100;
    return price.toFixed(2);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!hasChanges) {
      setFormError(t('serviceManagement.settings.noChanges'));
      return;
    }

    try {
      // Only send changed fields
      const updates: ServiceUpdate = {};
      Object.keys(formData).forEach(key => {
        const formKey = key as keyof ServiceUpdate;
        const serviceKey = key as keyof ServiceWithOpenIntervals;
        
        const formValue = formData[formKey];
        const serviceValue = service[serviceKey];
        
        if (formKey === 'description') {
          const formDesc = formValue as string | undefined;
          const serviceDesc = serviceValue as string | undefined;
          if ((formDesc || '') !== (serviceDesc || '')) {
            updates[formKey] = formDesc || '';
          }
        } else if (formKey === 'category_id') {
          const formCat = formValue as string | undefined;
          const serviceCat = serviceValue as string | undefined;
          if ((formCat || '') !== (serviceCat || '')) {
            updates[formKey] = formCat || undefined;
          }
        } else if (formValue !== serviceValue) {
          (updates as any)[formKey] = formValue;
        }
      });

      await onUpdateService(updates);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      setFormError(error.detail || t('serviceManagement.settings.error'));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CogIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t('serviceManagement.settings.title')}
            </h2>
            <p className="text-sm text-gray-600">
              {t('serviceManagement.settings.subtitle')}
            </p>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3"
          >
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">{t('serviceManagement.settings.success')}</span>
          </motion.div>
        )}

        {/* Error Message */}
        {formError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3"
          >
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">{formError}</span>
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <TagIcon className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">{t('serviceManagement.settings.basicInfo.title')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                {t('serviceManagement.settings.basicInfo.name.required')}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleNameChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                {t('serviceManagement.settings.basicInfo.slug')}
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                readOnly
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('serviceManagement.settings.basicInfo.slug.help')}
              </p>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                {t('serviceManagement.settings.basicInfo.description')}
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description || ''}
                onChange={handleInputChange}
                placeholder={t('serviceManagement.settings.basicInfo.description.placeholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Duration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">{t('serviceManagement.settings.pricing.title')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="duration_min" className="block text-sm font-medium text-gray-700 mb-2">
                <ClockIcon className="w-4 h-4 inline mr-1" />
                {t('serviceManagement.settings.pricing.duration')}
              </label>
              <input
                type="number"
                id="duration_min"
                name="duration_min"
                min="1"
                value={formData.duration_min || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('serviceManagement.settings.pricing.duration.help')}
                {formData.duration_min && (
                  <span className="ml-2 font-medium text-blue-600">
                    ({formatDuration(formData.duration_min)})
                  </span>
                )}
              </p>
            </div>

            <div>
              <label htmlFor="price_minor" className="block text-sm font-medium text-gray-700 mb-2">
                <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
                {t('serviceManagement.settings.pricing.price')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="price_minor"
                  name="price_minor"
                  min="0"
                  step="0.01"
                  value={formData.price_minor ? formatPrice(formData.price_minor) : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      price_minor: value === '' ? 0 : Math.round(Number(value) * 100)
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">ALL</span>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {t('serviceManagement.settings.pricing.price.help')}
                {formData.price_minor === 0 && (
                  <span className="ml-2 font-medium text-green-600">
                    ({t('serviceManagement.settings.pricing.free')})
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <UserGroupIcon className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">{t('serviceManagement.settings.advanced.title')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                <UserGroupIcon className="w-4 h-4 inline mr-1" />
                {t('serviceManagement.settings.advanced.capacity')}
              </label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                min="1"
                value={formData.capacity || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Optional"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('serviceManagement.settings.advanced.capacity.help')}
              </p>
            </div>

            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                <TagIcon className="w-4 h-4 inline mr-1" />
                {t('serviceManagement.settings.advanced.category')}
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t('serviceManagement.settings.advanced.category.placeholder')}</option>
                {/* TODO: Add categories from API */}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('serviceManagement.settings.advanced.status')}
              </label>
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="is_active"
                    checked={formData.is_active === true}
                    onChange={() => setFormData(prev => ({ ...prev, is_active: true }))}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <span className="ml-2 flex items-center">
                    <EyeIcon className="w-4 h-4 mr-1 text-green-600" />
                    {t('serviceManagement.settings.advanced.active')}
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="is_active"
                    checked={formData.is_active === false}
                    onChange={() => setFormData(prev => ({ ...prev, is_active: false }))}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <span className="ml-2 flex items-center">
                    <EyeSlashIcon className="w-4 h-4 mr-1 text-gray-500" />
                    {t('serviceManagement.settings.advanced.inactive')}
                  </span>
                </label>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <div className="flex items-start space-x-1">
                  <InformationCircleIcon className="w-4 h-4 mt-0.5 text-blue-500" />
                  <div>
                    <strong>{t('serviceManagement.settings.advanced.active')}:</strong> {t('serviceManagement.settings.advanced.active.help')}
                    <br />
                    <strong>{t('serviceManagement.settings.advanced.inactive')}:</strong> {t('serviceManagement.settings.advanced.inactive.help')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updating || !hasChanges}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t('serviceManagement.settings.saving')}
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                {t('serviceManagement.settings.save')}
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ServiceSettingsSection; 