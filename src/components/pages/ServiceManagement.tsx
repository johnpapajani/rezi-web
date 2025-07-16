import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { useServices } from '../../hooks/useServices';
import { useBusiness } from '../../hooks/useBusiness';
import { Service, ServiceCreate, ServiceUpdate } from '../../types';
import { 
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CogIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

const ServiceManagement: React.FC = () => {
  const { bizId } = useParams<{ bizId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { business, loading: businessLoading } = useBusiness({ bizId: bizId! });
  const { 
    services, 
    loading: servicesLoading, 
    error: servicesError, 
    creating, 
    updating, 
    deleting,
    createService, 
    updateService, 
    deleteService 
  } = useServices({ bizId: bizId! });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceCreate>({
    name: '',
    description: '',
    duration_minutes: 120,
    price_minor: 0,
    is_active: true,
    opening_hours: [
      { day_of_week: 1, opens_at: '09:00', closes_at: '22:00', is_closed: false }, // Monday
      { day_of_week: 2, opens_at: '09:00', closes_at: '22:00', is_closed: false }, // Tuesday
      { day_of_week: 3, opens_at: '09:00', closes_at: '22:00', is_closed: false }, // Wednesday
      { day_of_week: 4, opens_at: '09:00', closes_at: '22:00', is_closed: false }, // Thursday
      { day_of_week: 5, opens_at: '09:00', closes_at: '23:00', is_closed: false }, // Friday
      { day_of_week: 6, opens_at: '10:00', closes_at: '23:00', is_closed: false }, // Saturday
      { day_of_week: 0, opens_at: '10:00', closes_at: '21:00', is_closed: false }, // Sunday
    ],
  });

  const dayNames = [
    t('days.sunday'), 
    t('days.monday'), 
    t('days.tuesday'), 
    t('days.wednesday'), 
    t('days.thursday'), 
    t('days.friday'), 
    t('days.saturday')
  ];

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createService(formData);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    
    try {
      await updateService(editingService.id, formData);
      setEditingService(null);
      resetForm();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleDeleteService = async () => {
    if (!deletingService) return;
    
    try {
      await deleteService(deletingService.id);
      setDeletingService(null);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      duration_minutes: service.duration_minutes,
      price_minor: service.price_minor,
      is_active: service.is_active,
      opening_hours: service.opening_hours,
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration_minutes: 120,
      price_minor: 0,
      is_active: true,
      opening_hours: [
        { day_of_week: 1, opens_at: '09:00', closes_at: '22:00', is_closed: false },
        { day_of_week: 2, opens_at: '09:00', closes_at: '22:00', is_closed: false },
        { day_of_week: 3, opens_at: '09:00', closes_at: '22:00', is_closed: false },
        { day_of_week: 4, opens_at: '09:00', closes_at: '22:00', is_closed: false },
        { day_of_week: 5, opens_at: '09:00', closes_at: '23:00', is_closed: false },
        { day_of_week: 6, opens_at: '10:00', closes_at: '23:00', is_closed: false },
        { day_of_week: 0, opens_at: '10:00', closes_at: '21:00', is_closed: false },
      ],
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleToggleActive = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      is_active: e.target.checked
    }));
  };

  const handleHoursChange = (dayIndex: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      opening_hours: prev.opening_hours.map((hours, i) =>
        i === dayIndex ? { ...hours, [field]: value } : hours
      )
    }));
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

  const getOperatingHours = (service: Service): string => {
    const openDays = service.opening_hours.filter(h => !h.is_closed);
    if (openDays.length === 0) return 'Closed';
    if (openDays.length === 7) return 'Daily';
    
    const dayNames = [
      t('days.short.sunday'), 
      t('days.short.monday'), 
      t('days.short.tuesday'), 
      t('days.short.wednesday'), 
      t('days.short.thursday'), 
      t('days.short.friday'), 
      t('days.short.saturday')
    ];
    const sortedDays = openDays
      .map(h => dayNames[h.day_of_week])
      .sort((a, b) => {
        const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return dayOrder.indexOf(a) - dayOrder.indexOf(b);
      });
    
    return sortedDays.join(', ');
  };

  if (businessLoading || servicesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
                onClick={() => navigate(`/business/${bizId}`)}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center">
                <CogIcon className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {t('services.title')}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {business?.name}
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              {t('services.addService')}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Error Message */}
        {servicesError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">{servicesError}</span>
          </div>
        )}

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
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                {t('services.addService')}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                    <div className="flex items-center space-x-1">
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
                    </div>
                  </div>

                  {service.description && (
                    <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      <span>{formatDuration(service.duration_minutes)}</span>
                    </div>
                    {service.price_minor > 0 && (
                      <div className="flex items-center text-sm text-gray-500">
                        <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                        <span>{formatPrice(service.price_minor, business?.currency)}</span>
                      </div>
                    )}
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">{t('services.operatingHours')}: </span>
                      {getOperatingHours(service)}
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">{t('services.tables')}: </span>
                      {service.table_count} {service.table_count === 1 ? t('services.table') : t('services.tables')}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => navigate(`/business/${bizId}/services/${service.id}/tables`)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {t('services.manageTables')}
                    </button>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(service)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingService(service)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Service Modal */}
      <AnimatePresence>
        {(isCreateModalOpen || editingService) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingService ? t('services.editService') : t('services.addService')}
                </h3>
              </div>

              <form onSubmit={editingService ? handleUpdateService : handleCreateService} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('services.serviceName')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t('services.serviceNamePlaceholder')}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('services.duration')}
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        name="duration_minutes"
                        value={formData.duration_minutes}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                        required
                      />
                      <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-md">
                        {t('services.minutes')}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('services.description')}
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t('services.descriptionPlaceholder')}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={handleToggleActive}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    {t('services.active')}
                  </label>
                </div>

                {/* Operating Hours */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">{t('services.operatingHours')}</h4>
                  <div className="space-y-3">
                    {formData.opening_hours.map((hours, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-20 text-sm text-gray-600">
                          {dayNames[hours.day_of_week]}
                        </div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={!hours.is_closed}
                            onChange={(e) => handleHoursChange(index, 'is_closed', !e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-600">{t('services.open')}</span>
                        </label>
                        {!hours.is_closed && (
                          <>
                            <input
                              type="time"
                              value={hours.opens_at}
                              onChange={(e) => handleHoursChange(index, 'opens_at', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <span className="text-sm text-gray-600">{t('services.to')}</span>
                            <input
                              type="time"
                              value={hours.closes_at}
                              onChange={(e) => handleHoursChange(index, 'closes_at', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setEditingService(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {t('services.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={creating || updating}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {(creating || updating) && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    {editingService ? t('services.update') : t('services.create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-medium text-gray-900">
                    {t('services.deleteService')}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  {t('services.deleteConfirmation')} "{deletingService.name}"
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setDeletingService(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {t('services.cancel')}
                  </button>
                  <button
                    onClick={handleDeleteService}
                    disabled={deleting}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {deleting && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    {t('services.delete')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceManagement; 