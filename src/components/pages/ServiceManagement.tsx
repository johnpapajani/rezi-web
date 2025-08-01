import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { useServices } from '../../hooks/useServices';
import { useBusiness } from '../../hooks/useBusiness';
import { useAuth } from '../../hooks/useAuth';
import { useServiceCategories } from '../../hooks/useServiceCategories';
import { Service, ServiceCreate, ServiceUpdate, ServiceOpenIntervalCreate, Weekday, BookingMode } from '../../types';
import MobileOptimizedHeader from '../shared/MobileOptimizedHeader';
import { 
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
  InformationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const ServiceManagement: React.FC = () => {
  const { bizId } = useParams<{ bizId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const { t, currentLanguage, setLanguage, languages } = useTranslation();
  const { business, loading: businessLoading } = useBusiness({ bizId: bizId! });
  const { categories, loading: categoriesLoading, refetch: refetchCategories } = useServiceCategories();
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
    slug: '',
    description: '',
    duration_min: 15,
    price_minor: 0,
    category_id: '',
    is_active: true,
    booking_mode: BookingMode.appointment,
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

  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [formError, setFormError] = useState<string | null>(null);

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

  // Refresh categories when modal opens to ensure current language
  useEffect(() => {
    if (isCreateModalOpen || editingService) {
      refetchCategories();
    }
  }, [isCreateModalOpen, editingService, refetchCategories]);

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
    setFormError(null);
    setValidationErrors({});

    // Validate required fields
    const errors: { [key: string]: string } = {};
    
    if (!formData.name?.trim()) {
      errors.name = t('services.validation.nameRequired');
    }

    if (!formData.duration_min || formData.duration_min <= 0) {
      errors.duration_min = t('services.validation.durationRequired');
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      // Clean the service data - set default category if none selected
      const cleanServiceData = { ...formData };
      if (!cleanServiceData.category_id || cleanServiceData.category_id.trim() === '') {
        // Find the "Other" category by slug
        const otherCategory = categories.find(cat => 
          cat.slug === 'other' || 
          cat.slug === 'others' || 
          cat.name.toLowerCase().includes('other')
        );
        if (otherCategory) {
          cleanServiceData.category_id = otherCategory.id;
        } else {
          // If no "Other" category found, omit the field (fallback to previous behavior)
          delete cleanServiceData.category_id;
        }
      }

      // For session-based services, clear open intervals
      if (cleanServiceData.booking_mode === BookingMode.session) {
        cleanServiceData.open_intervals = [];
      }

      await createService(cleanServiceData);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error: any) {
      // Handle different types of errors
      if (error.message && error.message.includes('Validation errors:')) {
        setFormError(error.message);
      } else {
        setFormError(error.detail || error.message || t('services.error.createFailed'));
      }
    }
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    
    setFormError(null);
    setValidationErrors({});

    // Validate required fields
    const errors: { [key: string]: string } = {};
    
    if (!formData.name?.trim()) {
      errors.name = t('services.validation.nameRequired');
    }

    if (!formData.duration_min || formData.duration_min <= 0) {
      errors.duration_min = t('services.validation.durationRequired');
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
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
        booking_mode: formData.booking_mode,
      };
      await updateService(editingService.id, updateData);
      setEditingService(null);
      resetForm();
    } catch (error: any) {
      // Handle different types of errors
      if (error.message && error.message.includes('Validation errors:')) {
        setFormError(error.message);
      } else {
        setFormError(error.detail || error.message || t('services.error.updateFailed'));
      }
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
      booking_mode: service.booking_mode || BookingMode.appointment,
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
      duration_min: 15,
      price_minor: 0,
      category_id: '',
      is_active: true,
      booking_mode: BookingMode.appointment,
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
    setValidationErrors({});
    setFormError(null);
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

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear form error when user starts typing
    if (formError) {
      setFormError(null);
    }
  };

  const formatPriceDisplay = (priceMinor: number): string => {
    const price = priceMinor / 100;
    return price.toFixed(2);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      price_minor: value === '' ? 0 : Math.round(Number(value) * 100)
    }));
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

  const handleAddInterval = () => {
    const newInterval: ServiceOpenIntervalCreate = {
      weekday: Weekday.monday,
      start_time: '09:00',
      end_time: '17:00',
      notes: '',
    };
    setFormData(prev => ({
      ...prev,
      open_intervals: [...(prev.open_intervals || []), newInterval]
    }));
  };

  const handleRemoveInterval = (index: number) => {
    setFormData(prev => ({
      ...prev,
      open_intervals: prev.open_intervals?.filter((_, i) => i !== index) || []
    }));
  };

  const handleIntervalChange = (index: number, field: keyof ServiceOpenIntervalCreate, value: any) => {
    setFormData(prev => ({
      ...prev,
      open_intervals: prev.open_intervals?.map((interval, i) => 
        i === index ? { ...interval, [field]: value } : interval
      ) || []
    }));
  };

  const handleQuickSetup = (preset: 'weekdays' | 'weekends' | 'daily') => {
    const baseHours = { start_time: '09:00', end_time: '17:00', notes: '' };
    
    let intervals: ServiceOpenIntervalCreate[] = [];
    
    switch (preset) {
      case 'weekdays':
        intervals = [
          { weekday: Weekday.monday, ...baseHours },
          { weekday: Weekday.tuesday, ...baseHours },
          { weekday: Weekday.wednesday, ...baseHours },
          { weekday: Weekday.thursday, ...baseHours },
          { weekday: Weekday.friday, ...baseHours },
        ];
        break;
      case 'weekends':
        intervals = [
          { weekday: Weekday.saturday, ...baseHours },
          { weekday: Weekday.sunday, ...baseHours },
        ];
        break;
      case 'daily':
        intervals = weekdayNames.map(day => ({ weekday: day.weekday, ...baseHours }));
        break;
    }
    
    setFormData(prev => ({
      ...prev,
      open_intervals: intervals
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
      <MobileOptimizedHeader
        title={t('services.title')}
        subtitle={business?.name || ''}
        backUrl={`/business/${bizId}`}
        icon={CogIcon}
        variant="business"
        actions={[
          {
            label: t('services.addService'),
            onClick: () => setIsCreateModalOpen(true),
            variant: 'primary',
            icon: PlusIcon
          },
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
        {/* Page Header */}
        <div className="mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('services.title')}</h2>
            <p className="text-gray-600">{t('services.description')}</p>
          </div>
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
                    {service.table_count === 0 && (
                      <div className="flex items-center space-x-1 text-amber-600 text-xs mt-2 pt-2 border-t border-amber-100">
                        <ExclamationTriangleIcon className="w-3 h-3" />
                        <span className="font-medium">{t('serviceDashboard.notPublicWarning')}</span>
                      </div>
                    )}
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
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingService ? t('services.editService') : t('services.addService')}
                </h3>
              </div>

              <form onSubmit={editingService ? handleUpdateService : handleCreateService} className="p-4 sm:p-6 space-y-8">
                {/* Form Error Message */}
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

                {/* Basic Information Section */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <CogIcon className="w-6 h-6 text-blue-600" />
                    <h4 className="text-lg font-semibold text-gray-900">{t('serviceManagement.settings.basicInfo.title')}</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('services.serviceName')} *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation ${
                          validationErrors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder={t('services.serviceNamePlaceholder')}
                        required
                      />
                      {validationErrors.name && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('services.serviceSlug')}
                      </label>
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        placeholder={t('services.serviceSlugPlaceholder')}
                        required
                        readOnly
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {t('services.serviceSlugHelp')}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('services.category')}
                      </label>
                      <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      <p className="mt-1 text-xs text-gray-500">
                        {t('services.categoryHelp')}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('services.bookingMode.title')} *
                      </label>
                      <select
                        name="booking_mode"
                        value={formData.booking_mode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value={BookingMode.appointment}>
                          {t('services.bookingMode.appointment')}
                        </option>
                        <option value={BookingMode.session}>
                          {t('services.bookingMode.session')}
                        </option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        {formData.booking_mode === BookingMode.appointment 
                          ? t('services.bookingMode.appointmentDescription')
                          : t('services.bookingMode.sessionDescription')
                        }
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <ClockIcon className="w-4 h-4 inline mr-1" />
                        {t('services.duration')} *
                      </label>
                      <div className="flex">
                        <input
                          type="number"
                          name="duration_min"
                          value={formData.duration_min}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            validationErrors.duration_min ? 'border-red-500' : 'border-gray-300'
                          }`}
                          min="1"
                          required
                        />
                        <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-lg">
                          {t('services.minutes')}
                        </span>
                      </div>
                      {validationErrors.duration_min && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.duration_min}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('services.description')}
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('services.descriptionPlaceholder')}
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                    <h4 className="text-lg font-semibold text-gray-900">{t('serviceManagement.settings.pricing.title')}</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
                        {t('serviceManagement.settings.pricing.price')}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price_minor ? formatPriceDisplay(formData.price_minor) : ''}
                          onChange={handlePriceChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-sm">{business?.currency || 'ALL'}</span>
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
                  </div>
                </div>

                {/* Operating Hours Section - Only for appointment-based services */}
                {formData.booking_mode === BookingMode.appointment && (
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <ClockIcon className="w-6 h-6 text-purple-600" />
                      <h4 className="text-lg font-semibold text-gray-900">{t('serviceOpenIntervals.operatingHours')}</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickSetup('weekdays')}
                        className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                      >
                        {t('serviceOpenIntervals.weekdaysOnly')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickSetup('weekends')}
                        className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                      >
                        {t('serviceOpenIntervals.weekendsOnly')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickSetup('daily')}
                        className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                      >
                        {t('serviceOpenIntervals.allDays')}
                      </button>
                      <button
                        type="button"
                        onClick={handleAddInterval}
                        className="px-3 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                      >
                        <PlusIcon className="w-4 h-4 inline mr-1" />
                        {t('serviceOpenIntervals.addInterval')}
                      </button>
                    </div>
                  </div>

                  {(!formData.open_intervals || formData.open_intervals.length === 0) ? (
                    <div className="text-center py-8 border border-gray-200 rounded-lg bg-white">
                      <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{t('serviceOpenIntervals.noIntervals')}</h3>
                      <p className="text-sm text-gray-600 mb-4">{t('serviceOpenIntervals.noIntervalsDescription')}</p>
                      <button
                        type="button"
                        onClick={handleAddInterval}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        {t('serviceOpenIntervals.addInterval')}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.open_intervals.map((interval, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4 border border-gray-200 rounded-lg bg-white"
                        >
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t('serviceOpenIntervals.weekday')}
                            </label>
                            <select
                              value={interval.weekday}
                              onChange={(e) => handleIntervalChange(index, 'weekday', e.target.value as unknown as Weekday)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              {weekdayNames.map((option) => (
                                <option key={option.weekday} value={option.weekday}>
                                  {option.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t('serviceOpenIntervals.startTime')}
                            </label>
                            <input
                              type="time"
                              value={interval.start_time}
                              onChange={(e) => handleIntervalChange(index, 'start_time', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t('serviceOpenIntervals.endTime')}
                            </label>
                            <input
                              type="time"
                              value={interval.end_time}
                              onChange={(e) => handleIntervalChange(index, 'end_time', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t('serviceOpenIntervals.notes')}
                            </label>
                            <input
                              type="text"
                              value={interval.notes || ''}
                              onChange={(e) => handleIntervalChange(index, 'notes', e.target.value)}
                              placeholder={t('serviceOpenIntervals.notesPlaceholder')}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveInterval(index)}
                              className="w-full px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <TrashIcon className="w-4 h-4 mx-auto" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <InformationCircleIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <div className="text-sm text-blue-700">
                        <p className="font-medium">{t('serviceOpenIntervals.infoTitle')}</p>
                        <ul className="mt-1 list-disc list-inside space-y-1">
                          <li>{t('serviceOpenIntervals.info1')}</li>
                          <li>{t('serviceOpenIntervals.info2')}</li>
                          <li>{t('serviceOpenIntervals.info3')}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                )}

                {/* Session Mode Information */}
                {formData.booking_mode === BookingMode.session && (
                <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <InformationCircleIcon className="w-6 h-6 text-yellow-600" />
                    <h4 className="text-lg font-semibold text-gray-900">{t('services.bookingMode.sessionInfo.title')}</h4>
                  </div>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>{t('services.bookingMode.sessionInfo.description')}</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>{t('services.bookingMode.sessionInfo.point1')}</li>
                      <li>{t('services.bookingMode.sessionInfo.point2')}</li>
                      <li>{t('services.bookingMode.sessionInfo.point3')}</li>
                    </ul>
                  </div>
                </div>
                )}

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row sm:justify-end items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setEditingService(null);
                      resetForm();
                    }}
                    className="px-6 py-3 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 touch-manipulation"
                  >
                    {t('services.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={creating || updating}
                    className="px-6 py-3 sm:py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center touch-manipulation"
                  >
                    {(creating || updating) && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
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