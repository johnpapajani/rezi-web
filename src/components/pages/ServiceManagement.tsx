import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { useServices } from '../../hooks/useServices';
import { useBusiness } from '../../hooks/useBusiness';
import { useAuth } from '../../hooks/useAuth';
import { useServiceCategories } from '../../hooks/useServiceCategories';
import { Service, ServiceCreate, ServiceUpdate, ServiceOpenIntervalCreate, Weekday } from '../../types';
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
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

const ServiceManagement: React.FC = () => {
  const { bizId } = useParams<{ bizId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const { t, currentLanguage, setLanguage, languages } = useTranslation();
  const { business, loading: businessLoading } = useBusiness({ bizId: bizId! });
  const { categories, loading: categoriesLoading } = useServiceCategories();
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
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [formData, setFormData] = useState<ServiceCreate>({
    name: '',
    slug: '',
    description: '',
    duration_min: 120,
    price_minor: 0,
    category_id: '',
    is_active: true,
    open_intervals: [
      { weekday: Weekday.monday, start_time: '09:00', end_time: '22:00' },
      { weekday: Weekday.tuesday, start_time: '09:00', end_time: '22:00' },
      { weekday: Weekday.wednesday, start_time: '09:00', end_time: '22:00' },
      { weekday: Weekday.thursday, start_time: '09:00', end_time: '22:00' },
      { weekday: Weekday.friday, start_time: '09:00', end_time: '23:00' },
      { weekday: Weekday.saturday, start_time: '10:00', end_time: '23:00' },
      { weekday: Weekday.sunday, start_time: '10:00', end_time: '21:00' },
    ],
  });

  // Auto-open create modal if 'create' parameter is present
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setIsCreateModalOpen(true);
      // Remove the parameter from URL to clean it up
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('create');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const weekdayNames = [
    { weekday: Weekday.monday, name: t('days.monday') },
    { weekday: Weekday.tuesday, name: t('days.tuesday') },
    { weekday: Weekday.wednesday, name: t('days.wednesday') },
    { weekday: Weekday.thursday, name: t('days.thursday') },
    { weekday: Weekday.friday, name: t('days.friday') },
    { weekday: Weekday.saturday, name: t('days.saturday') },
    { weekday: Weekday.sunday, name: t('days.sunday') },
  ];

  const handleSignOut = async () => {
    await signOut();
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
      // Only update basic service fields, not open intervals
      const updateData: ServiceUpdate = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        duration_min: formData.duration_min,
        price_minor: formData.price_minor,
        category_id: formData.category_id || undefined,
        is_active: formData.is_active,
      };
      await updateService(editingService.id, updateData);
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
      slug: service.slug,
      description: service.description || '',
      duration_min: service.duration_min,
      price_minor: service.price_minor,
      category_id: service.category_id || '',
      is_active: service.is_active,
      open_intervals: [
        { weekday: Weekday.monday, start_time: '09:00', end_time: '22:00' },
        { weekday: Weekday.tuesday, start_time: '09:00', end_time: '22:00' },
        { weekday: Weekday.wednesday, start_time: '09:00', end_time: '22:00' },
        { weekday: Weekday.thursday, start_time: '09:00', end_time: '22:00' },
        { weekday: Weekday.friday, start_time: '09:00', end_time: '23:00' },
        { weekday: Weekday.saturday, start_time: '10:00', end_time: '23:00' },
        { weekday: Weekday.sunday, start_time: '10:00', end_time: '21:00' },
      ],
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      duration_min: 120,
      price_minor: 0,
      category_id: '',
      is_active: true,
      open_intervals: [
        { weekday: Weekday.monday, start_time: '09:00', end_time: '22:00' },
        { weekday: Weekday.tuesday, start_time: '09:00', end_time: '22:00' },
        { weekday: Weekday.wednesday, start_time: '09:00', end_time: '22:00' },
        { weekday: Weekday.thursday, start_time: '09:00', end_time: '22:00' },
        { weekday: Weekday.friday, start_time: '09:00', end_time: '23:00' },
        { weekday: Weekday.saturday, start_time: '10:00', end_time: '23:00' },
        { weekday: Weekday.sunday, start_time: '10:00', end_time: '21:00' },
      ],
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));

    // Auto-generate slug from name
    if (name === 'name') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };

  const handleToggleActive = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      is_active: e.target.checked
    }));
  };

  const handleOpenIntervalsChange = (weekday: Weekday, field: 'start_time' | 'end_time', value: string) => {
    setFormData(prev => ({
      ...prev,
      open_intervals: prev.open_intervals?.map((interval) =>
        interval.weekday === weekday ? { ...interval, [field]: value } : interval
      ) || []
    }));
  };

  const handleToggleWeekday = (weekday: Weekday, isEnabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      open_intervals: isEnabled 
        ? [...(prev.open_intervals || []), { weekday, start_time: '09:00', end_time: '22:00' }]
        : (prev.open_intervals || []).filter(interval => interval.weekday !== weekday)
    }));
  };

  const formatPrice = (priceMinor: number): string => {
    const price = priceMinor / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: business?.currency || 'ALL',
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-0 sm:h-16 space-y-3 sm:space-y-0">
            <div className="flex items-center min-w-0">
              <button
                onClick={() => navigate(`/business/${bizId}`)}
                className="mr-3 sm:mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 flex-shrink-0"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center min-w-0">
                <CogIcon className="w-8 h-8 text-blue-600 mr-3 flex-shrink-0" />
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                    {t('services.title')}
                  </h1>
                  <p className="text-sm text-gray-500 truncate">
                    {business?.name}
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

              {/* User Info */}
              <div className="flex items-center space-x-2">
                <UserCircleIcon className="w-6 h-6 text-gray-400" />
                <span className="text-sm text-gray-700">{user?.name}</span>
              </div>

              {/* Sign Out */}
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
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('services.title')}</h2>
            <p className="text-gray-600">{t('services.description')}</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            {t('services.addService')}
          </button>
        </div>

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
            <CogIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-xl font-medium text-gray-900">{t('services.noServices.title')}</h3>
            <p className="mt-2 text-gray-600 max-w-md mx-auto">
              {t('services.noServices.description')}
            </p>
            <div className="mt-6 text-sm text-gray-500">
              <p>{t('services.createServiceHelp')}</p>
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
                      <span>{formatDuration(service.duration_min)}</span>
                    </div>
                    {service.price_minor > 0 && (
                      <div className="flex items-center text-sm text-gray-500">
                        <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                        <span>{formatPrice(service.price_minor)}</span>
                      </div>
                    )}
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">{t('services.operatingHours')}: </span>
                      {service.open_intervals && service.open_intervals.length > 0 
                        ? service.open_intervals.length === 7 
                          ? t('services.daily') 
                          : service.open_intervals
                              .map((interval) => weekdayNames.find(w => w.weekday === interval.weekday)?.name)
                              .filter((name): name is string => Boolean(name))
                              .sort((a, b) => {
                                const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                                return dayOrder.indexOf(a) - dayOrder.indexOf(b);
                              })
                              .join(', ')
                        : t('services.noSchedule')
                      }
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">{t('services.tables')}: </span>
                      {service.table_count} {service.table_count === 1 ? t('services.table') : t('services.tables')}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => navigate(`/service/${service.id}/open-intervals`)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {t('services.manageHours')}
                      </button>
                      <button
                        onClick={() => navigate(`/business/${bizId}/services/${service.id}/tables`)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {t('services.manageTables')}
                      </button>
                    </div>
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
            className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 sm:p-6 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingService ? t('services.editService') : t('services.addService')}
                </h3>
              </div>

              <form onSubmit={editingService ? handleUpdateService : handleCreateService} className="p-4 sm:p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('services.serviceName')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
                      placeholder={t('services.serviceNamePlaceholder')}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('services.serviceSlug')}
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('services.serviceSlugPlaceholder')}
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      {t('services.serviceSlugHelp')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('services.category')}
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={categoriesLoading}
                    >
                      <option value="">{t('services.selectCategory')}</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {categoriesLoading && (
                      <p className="mt-1 text-sm text-gray-500">{t('services.loadingCategories')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('services.duration')}
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        name="duration_min"
                        value={formData.duration_min}
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
                    {weekdayNames.map((day) => (
                      <div key={day.weekday} className="flex items-center space-x-4">
                        <div className="w-20 text-sm text-gray-600">
                          {day.name}
                        </div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.open_intervals?.some(interval => interval.weekday === day.weekday)}
                            onChange={(e) => handleToggleWeekday(day.weekday, e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-600">{t('services.open')}</span>
                        </label>
                        {formData.open_intervals?.some(interval => interval.weekday === day.weekday) && (
                          <>
                            <input
                              type="time"
                              value={formData.open_intervals?.find(interval => interval.weekday === day.weekday)?.start_time}
                              onChange={(e) => handleOpenIntervalsChange(day.weekday, 'start_time', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <span className="text-sm text-gray-600">{t('services.to')}</span>
                            <input
                              type="time"
                              value={formData.open_intervals?.find(interval => interval.weekday === day.weekday)?.end_time}
                              onChange={(e) => handleOpenIntervalsChange(day.weekday, 'end_time', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row sm:justify-end items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setEditingService(null);
                      resetForm();
                    }}
                    className="px-4 py-3 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 touch-manipulation"
                  >
                    {t('services.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={creating || updating}
                    className="px-4 py-3 sm:py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center touch-manipulation"
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