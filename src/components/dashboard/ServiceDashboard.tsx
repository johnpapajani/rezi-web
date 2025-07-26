import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { useServices } from '../../hooks/useServices';
import { useBusiness } from '../../hooks/useBusiness';
import { useServiceCategories } from '../../hooks/useServiceCategories';
import { useBookings, useCalendarBookings } from '../../hooks/useBookings';
import { BusinessUpdate, Service, ServiceUpdate, ServiceCreate, Weekday, BookingWithService, BookingFilters, BookingStatus } from '../../types';
import MobileOptimizedHeader from '../shared/MobileOptimizedHeader';
import BusinessBookingsCalendar from '../pages/BusinessBookingsCalendar';
import { 
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EyeIcon,
  EyeSlashIcon,
  RectangleGroupIcon,
  ArrowRightIcon,
  PlusIcon,
  MapPinIcon,
  CheckCircleIcon,
  PhotoIcon,
  QrCodeIcon,
  PencilIcon,
  XMarkIcon,
  CogIcon,
  TagIcon,
  UserGroupIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ListBulletIcon,
  ViewColumnsIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon
} from '@heroicons/react/24/outline';

type TabType = 'services' | 'settings' | 'bookings';
type BookingViewType = 'list' | 'calendar';

const ServiceDashboard: React.FC = () => {
  const { bizId } = useParams<{ bizId: string }>();
  const { signOut } = useAuth();
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState<TabType>('services');
  const [bookingView, setBookingView] = useState<BookingViewType>('list');
  const navigate = useNavigate();
  
  const { business, loading: businessLoading, error: businessError, updating, updateBusiness } = useBusiness({ bizId: bizId || '' });
  const { services, loading: servicesLoading, error: servicesError, updating: serviceUpdating, creating: serviceCreating, updateService, createService } = useServices({ bizId: bizId || '', activeOnly: false });
  const { categories, loading: categoriesLoading, refetch: refetchCategories } = useServiceCategories();
  
  // Booking management
  const { bookings, loading: bookingsLoading, error: bookingsError, searchBookings, updateBookingStatus, rescheduleBooking } = useBookings({ bizId: bizId || '' });
  const { calendarBookings, loading: calendarLoading, fetchCalendarBookings } = useCalendarBookings({ bizId: bizId || '' });

  // Service editing state
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [serviceFormData, setServiceFormData] = useState<ServiceUpdate>({});
  const [showServiceSuccess, setShowServiceSuccess] = useState(false);
  const [serviceFormError, setServiceFormError] = useState<string | null>(null);
  const [hasServiceChanges, setHasServiceChanges] = useState(false);

  // Business Settings form state
  const [formData, setFormData] = useState<BusinessUpdate>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Booking filtering and management state
  const [bookingFilters, setBookingFilters] = useState<BookingFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
  const [serviceFilter, setServiceFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'week' | 'month' | ''>('');
  const [selectedBooking, setSelectedBooking] = useState<BookingWithService | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);

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

  // Populate service form when service data loads
  useEffect(() => {
    if (editingService) {
      setServiceFormData({
        name: editingService.name,
        slug: editingService.slug,
        description: editingService.description || '',
        duration_min: editingService.duration_min,
        price_minor: editingService.price_minor,
        is_active: editingService.is_active,
        category_id: editingService.category_id || '',
        capacity: editingService.capacity || undefined,
      });
    } else if (isCreateModalOpen) {
      // Reset form for creation
      setServiceFormData({
        name: '',
        slug: '',
        description: '',
        duration_min: 60,
        price_minor: 0,
        is_active: true,
        category_id: '',
        capacity: undefined,
      });
    }
  }, [editingService, isCreateModalOpen]);

  // Refresh categories when either modal opens
  useEffect(() => {
    if (editingService || isCreateModalOpen) {
      refetchCategories();
    }
  }, [editingService, isCreateModalOpen, refetchCategories]);

  // Check for service form changes
  useEffect(() => {
    if (isCreateModalOpen) {
      // For create mode, check if required fields are filled
      const hasRequiredFields = !!(serviceFormData.name?.trim() && serviceFormData.duration_min && serviceFormData.duration_min > 0);
      setHasServiceChanges(hasRequiredFields);
    } else if (editingService) {
      // For edit mode, check if any fields have changed
      const hasFieldChanges = Object.keys(serviceFormData).some(key => {
        const formKey = key as keyof ServiceUpdate;
        const serviceKey = key as keyof Service;
        
        const formValue = serviceFormData[formKey];
        const serviceValue = editingService[serviceKey];
        
        if (formKey === 'description') {
          return (formValue || '') !== (serviceValue || '');
        }
        if (formKey === 'category_id') {
          return (formValue || '') !== (serviceValue || '');
        }
        
        return formValue !== serviceValue;
      });
      setHasServiceChanges(hasFieldChanges);
    } else {
      setHasServiceChanges(false);
    }
  }, [serviceFormData, editingService, isCreateModalOpen]);

  // Load bookings when tab is selected
  useEffect(() => {
    if (currentTab === 'bookings' && bizId) {
      searchBookings(bookingFilters);
    }
  }, [currentTab, bizId, searchBookings, bookingFilters]);

  // Load calendar bookings for calendar view
  useEffect(() => {
    if (currentTab === 'bookings' && bizId) {
      // Fetch bookings from 3 months ago to 3 months ahead to see past and future bookings
      const today = new Date();
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
      
      // Format dates as ISO strings for the API
      const dateFrom = threeMonthsAgo.toISOString().split('T')[0];
      const dateTo = threeMonthsFromNow.toISOString().split('T')[0];
      
      console.log('Fetching calendar bookings for date range:', dateFrom, 'to', dateTo);
      
      fetchCalendarBookings(dateFrom, dateTo);
    }
  }, [currentTab, bizId, fetchCalendarBookings]);

  // Apply booking filters
  useEffect(() => {
    if (currentTab !== 'bookings') return;

    const filters: BookingFilters = {};
    
    if (searchTerm) {
      filters.customer_name = searchTerm;
    }
    
    if (statusFilter) {
      filters.status = statusFilter;
    }

    if (serviceFilter) {
      filters.service_id = serviceFilter;
    }

    if (dateFilter) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      switch (dateFilter) {
        case 'today':
          const todayStart = new Date(today);
          todayStart.setHours(0, 0, 0, 0);
          const todayEnd = new Date(today);
          todayEnd.setHours(23, 59, 59, 999);
          filters.date_from = todayStart.toISOString();
          filters.date_to = todayEnd.toISOString();
          break;
        case 'tomorrow':
          const tomorrowStart = new Date(tomorrow);
          tomorrowStart.setHours(0, 0, 0, 0);
          const tomorrowEnd = new Date(tomorrow);
          tomorrowEnd.setHours(23, 59, 59, 999);
          filters.date_from = tomorrowStart.toISOString();
          filters.date_to = tomorrowEnd.toISOString();
          break;
        case 'week':
          const weekStart = new Date(today);
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(today);
          weekEnd.setDate(weekEnd.getDate() + 7);
          weekEnd.setHours(23, 59, 59, 999);
          filters.date_from = weekStart.toISOString();
          filters.date_to = weekEnd.toISOString();
          break;
        case 'month':
          const monthStart = new Date(today);
          monthStart.setHours(0, 0, 0, 0);
          const monthEnd = new Date(today);
          monthEnd.setMonth(monthEnd.getMonth() + 1);
          monthEnd.setHours(23, 59, 59, 999);
          filters.date_from = monthStart.toISOString();
          filters.date_to = monthEnd.toISOString();
          break;
      }
    }

    setBookingFilters(filters);
  }, [searchTerm, statusFilter, serviceFilter, dateFilter, currentTab]);

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

  const formatDateTimeInBusinessTimezone = (dateTimeString: string): { date: string; time: string } => {
    const date = new Date(dateTimeString);
    const timezone = business?.timezone || 'UTC';
    
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    return {
      date: dateFormatter.format(date),
      time: timeFormatter.format(date)
    };
  };

  const handleServiceSelect = (serviceId: string) => {
    navigate(`/service/${serviceId}`);
  };

  const handleCreateService = () => {
    setIsCreateModalOpen(true);
  };

  // Service editing handlers
  const openEditServiceModal = (service: Service, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    setEditingService(service);
  };

  const closeServiceModal = () => {
    setEditingService(null);
    setIsCreateModalOpen(false);
    setServiceFormData({});
    setServiceFormError(null);
    setShowServiceSuccess(false);
  };

  const handleServiceInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setServiceFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : Number(value)) :
              type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              value
    }));
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleServiceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setServiceFormData(prev => ({
      ...prev,
      name: newName,
      slug: generateSlug(newName)
    }));
  };

  const formatServicePrice = (priceMinor: number): string => {
    const price = priceMinor / 100;
    return price.toFixed(2);
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServiceFormError(null);

    if (!hasServiceChanges) {
      if (isCreateModalOpen) {
        setServiceFormError(t('services.validation.nameRequired'));
      } else {
        setServiceFormError(t('serviceManagement.settings.noChanges'));
      }
      return;
    }

    try {
      if (isCreateModalOpen) {
        // Create new service
        const createData: ServiceCreate = {
          name: serviceFormData.name!,
          slug: serviceFormData.slug!,
          description: serviceFormData.description || '',
          duration_min: serviceFormData.duration_min!,
          price_minor: serviceFormData.price_minor || 0,
          category_id: serviceFormData.category_id || undefined,
          is_active: serviceFormData.is_active ?? true,
          open_intervals: [
            { weekday: Weekday.monday, start_time: '09:00', end_time: '17:00' },
            { weekday: Weekday.tuesday, start_time: '09:00', end_time: '17:00' },
            { weekday: Weekday.wednesday, start_time: '09:00', end_time: '17:00' },
            { weekday: Weekday.thursday, start_time: '09:00', end_time: '17:00' },
            { weekday: Weekday.friday, start_time: '09:00', end_time: '17:00' },
            { weekday: Weekday.saturday, start_time: '10:00', end_time: '16:00' },
            { weekday: Weekday.sunday, start_time: '10:00', end_time: '16:00' },
          ],
        };

        // Set default category if none selected
        if (!createData.category_id || createData.category_id.trim() === '') {
          // Find the "Other" category by slug
          const otherCategory = categories.find(cat => 
            cat.slug === 'other' || 
            cat.slug === 'others' || 
            cat.name.toLowerCase().includes('other')
          );
          if (otherCategory) {
            createData.category_id = otherCategory.id;
          } else {
            // If no "Other" category found, omit the field
            delete createData.category_id;
          }
        }
        
        await createService(createData);
        setShowServiceSuccess(true);
        setTimeout(() => {
          closeServiceModal();
        }, 2000);
      } else if (editingService) {
        // Update existing service
        const updates: ServiceUpdate = {};
        Object.keys(serviceFormData).forEach(key => {
          const formKey = key as keyof ServiceUpdate;
          const serviceKey = key as keyof Service;
          
          const formValue = serviceFormData[formKey];
          const serviceValue = editingService[serviceKey];
          
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

        await updateService(editingService.id, updates);
        setShowServiceSuccess(true);
        setTimeout(() => {
          closeServiceModal();
        }, 2000);
      }
    } catch (error: any) {
      if (isCreateModalOpen) {
        setServiceFormError(error.detail || error.message || t('services.error.createFailed'));
      } else {
        setServiceFormError(error.detail || error.message || t('services.error.updateFailed'));
      }
    }
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
            onClick={() => window.open(`/business/${bizId}/qr`, '_blank')}
            className="inline-flex items-center justify-center px-4 py-2 border border-purple-300 text-sm font-medium rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 touch-manipulation"
          >
            <QrCodeIcon className="w-4 h-4 mr-2" />
            {t('business.qr.title')}
          </button>
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
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => openEditServiceModal(service, e)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title={t('services.editService')}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>

                    {service.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                    )}

                    {/* Mobile-optimized statistics layout */}
                    <div className="mb-4">
                      {/* Primary stats row - Duration and Price */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                          <ClockIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600 text-sm font-medium">{formatDuration(service.duration_min)}</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                          <CurrencyDollarIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600 text-sm font-medium">
                            {service.price_minor > 0 ? formatPrice(service.price_minor, business?.currency) : t('common.free')}
                          </span>
                        </div>
                      </div>
                      {/* Secondary stats row - Tables and Monthly Bookings */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <RectangleGroupIcon className="w-3 h-3" />
                          <span>{service.table_count} {service.table_count === 1 ? t('services.table') : t('services.tables')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CalendarDaysIcon className="w-3 h-3" />
                          <span>{service.monthly_reservations || 0} {t('serviceDashboard.thisMonth')}</span>
                        </div>
                      </div>
                      {/* Availability Status */}
                      {service.table_count === 0 && (
                        <div className="flex items-center space-x-1 text-amber-600 text-xs mt-2 pt-2 border-t border-gray-100">
                          <ExclamationTriangleIcon className="w-3 h-3" />
                          <span className="font-medium">{t('serviceDashboard.notPublicWarning')}</span>
                        </div>
                      )}
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
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => openEditServiceModal(service, e)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title={t('services.editService')}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <EyeSlashIcon className="w-3 h-3 mr-1" />
                          {t('common.inactive')}
                        </span>
                      </div>
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

  const renderBookingsTab = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
                 <h2 className="text-xl font-semibold text-gray-900">
           {t('bookings.list.title')}
         </h2>
         <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
           <button
             onClick={() => setBookingView('list')}
             className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
               bookingView === 'list'
                 ? 'text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                 : 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
             }`}
           >
             <ListBulletIcon className="w-4 h-4 mr-2" />
             {t('common.list')}
           </button>
           <button
             onClick={() => setBookingView('calendar')}
             className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
               bookingView === 'calendar'
                 ? 'text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                 : 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
             }`}
           >
             <ViewColumnsIcon className="w-4 h-4 mr-2" />
             {t('bookings.calendar.title')}
           </button>
         </div>
      </div>

      {bookingView === 'list' && (
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-500" />
                                     <input
                     type="text"
                     placeholder={t('bookings.list.searchPlaceholder')}
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   />
                 </div>
                 <div className="flex items-center space-x-2">
                   <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-500" />
                   <select
                     value={statusFilter}
                     onChange={(e) => setStatusFilter(e.target.value as BookingStatus | '')}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   >
                     <option value="">{t('bookings.list.filters.allStatuses')}</option>
                     <option value="pending">{t('bookings.list.filters.pending')}</option>
                     <option value="confirmed">{t('bookings.list.filters.confirmed')}</option>
                     <option value="cancelled">{t('bookings.list.filters.cancelled')}</option>
                     <option value="completed">{t('bookings.list.filters.completed')}</option>
                   </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                                     <thead className="bg-gray-50">
                     <tr>
                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         {t('bookings.list.customer')}
                       </th>
                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         {t('bookings.list.service')}
                       </th>
                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         {t('bookings.list.dateTime')}
                       </th>
                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         {t('bookings.list.status')}
                       </th>
                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         {t('bookings.list.actions')}
                       </th>
                     </tr>
                   </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                                                              {bookingsLoading ? (
                       <tr>
                         <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                           {t('common.loading')}
                         </td>
                       </tr>
                     ) : bookingsError ? (
                       <tr>
                         <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-center text-sm text-red-600">
                           {bookingsError}
                         </td>
                       </tr>
                     ) : bookings.length === 0 ? (
                       <tr>
                         <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                           {t('bookings.list.noBookings')}
                         </td>
                       </tr>
                    ) : (
                                             bookings.map((booking) => (
                         <tr key={booking.id}>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                             {booking.customer_name}
                           </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {booking.service_name}
                          </td>
                                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                             {(() => {
                               const { date, time } = formatDateTimeInBusinessTimezone(booking.starts_at);
                               return `${date} ${time}`;
                             })()}
                           </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              booking.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : booking.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                :                                booking.status === 'cancelled'
                               ? 'bg-red-100 text-red-800'
                               : 'bg-gray-100 text-gray-800'
                             }`}>
                               {t(`bookings.list.filters.${booking.status}`)}
                             </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                         <button
                               onClick={() => setSelectedBooking(booking)}
                               className="text-blue-600 hover:text-blue-900 mr-3"
                               title={t('bookings.list.actions.viewDetails')}
                             >
                               <EyeIcon className="w-5 h-5" />
                             </button>
                             {booking.status === 'pending' && (
                               <>
                                 <button
                                   onClick={() => updateBookingStatus(booking.id, { status: BookingStatus.confirmed })}
                                   className="text-green-600 hover:text-green-900 mr-3"
                                   title={t('common.confirm')}
                                 >
                                   <CheckCircleIcon className="w-5 h-5" />
                                 </button>
                                 <button
                                   onClick={() => updateBookingStatus(booking.id, { status: BookingStatus.cancelled })}
                                   className="text-red-600 hover:text-red-900"
                                   title={t('bookings.list.actions.cancel')}
                                 >
                                   <XMarkIcon className="w-5 h-5" />
                                 </button>
                               </>
                             )}
                             {booking.status === 'confirmed' && (
                               <button
                                 onClick={() => updateBookingStatus(booking.id, { status: BookingStatus.completed })}
                                 className="text-purple-600 hover:text-purple-900"
                                 title={t('common.complete')}
                               >
                                 <CheckCircleIcon className="w-5 h-5" />
                               </button>
                             )}
                             {booking.status === 'cancelled' && (
                               <button
                                 onClick={() => updateBookingStatus(booking.id, { status: BookingStatus.pending })}
                                 className="text-yellow-600 hover:text-yellow-900"
                                 title={t('common.reopen')}
                               >
                                 <ArrowRightIcon className="w-5 h-5" />
                               </button>
                             )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

             {bookingView === 'calendar' && (
         <div className="mt-6">
           {calendarLoading ? (
             <div className="text-center py-8">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
               <p className="text-gray-600">{t('common.loading')}</p>
             </div>
           ) : (
             <BusinessBookingsCalendar
               bookings={calendarBookings.length > 0 ? calendarBookings : bookings}
               businessTimezone={business?.timezone}
               onBookingClick={(booking: BookingWithService) => setSelectedBooking(booking)}
             />
           )}
         </div>
       )}

      {selectedBooking && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 sm:p-6 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                                     <h3 className="text-lg font-medium text-gray-900">
                     {t('bookings.list.actions.viewDetails')}
                   </h3>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <p className="text-sm font-medium text-gray-700">{t('bookings.list.customer')}</p>
                     <p className="text-lg font-semibold text-gray-900">{selectedBooking.customer_name}</p>
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-700">{t('bookings.list.service')}</p>
                     <p className="text-lg font-semibold text-gray-900">{selectedBooking.service_name}</p>
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-700">{t('bookings.list.dateTime')}</p>
                     <p className="text-lg font-semibold text-gray-900">
                       {(() => {
                         const { date, time } = formatDateTimeInBusinessTimezone(selectedBooking.starts_at);
                         return `${date} ${time}`;
                       })()}
                     </p>
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-700">{t('bookings.list.status')}</p>
                     <p className="text-lg font-semibold text-gray-900">
                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                         selectedBooking.status === 'pending'
                           ? 'bg-yellow-100 text-yellow-800'
                           : selectedBooking.status === 'confirmed'
                           ? 'bg-green-100 text-green-800'
                           : selectedBooking.status === 'cancelled'
                           ? 'bg-red-100 text-red-800'
                           : 'bg-gray-100 text-gray-800'
                       }`}>
                         {t(`bookings.list.filters.${selectedBooking.status}`)}
                       </span>
                     </p>
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-700">{t('common.partySize')}</p>
                     <p className="text-lg font-semibold text-gray-900">{selectedBooking.party_size} {selectedBooking.party_size === 1 ? t('bookings.list.person') : t('bookings.list.people')}</p>
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-700">{t('common.contact')}</p>
                     <p className="text-lg font-semibold text-gray-900">
                       <PhoneIcon className="w-5 h-5 inline mr-1" /> {selectedBooking.customer_phone || t('common.notProvided')}
                       <br />
                       <EnvelopeIcon className="w-5 h-5 inline mr-1" /> {selectedBooking.customer_email || t('common.notProvided')}
                     </p>
                   </div>
                 </div>

                                 {selectedBooking.status === 'pending' && (
                   <div className="flex justify-end space-x-3">
                     <button
                       onClick={async () => {
                         try {
                           const updatedBooking = await updateBookingStatus(selectedBooking.id, { status: BookingStatus.confirmed });
                           setSelectedBooking(updatedBooking);
                         } catch (error) {
                           console.error('Failed to update booking status:', error);
                         }
                       }}
                       className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                     >
                       <CheckCircleIcon className="w-4 h-4 mr-2" /> {t('common.confirm')}
                     </button>
                     <button
                       onClick={async () => {
                         try {
                           const updatedBooking = await updateBookingStatus(selectedBooking.id, { status: BookingStatus.cancelled });
                           setSelectedBooking(updatedBooking);
                         } catch (error) {
                           console.error('Failed to update booking status:', error);
                         }
                       }}
                       className="px-6 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                     >
                       <XMarkIcon className="w-4 h-4 mr-2" /> {t('common.cancel')}
                     </button>
                   </div>
                 )}
                 {selectedBooking.status === 'confirmed' && (
                   <div className="flex justify-end space-x-3">
                     <button
                       onClick={async () => {
                         try {
                           const updatedBooking = await updateBookingStatus(selectedBooking.id, { status: BookingStatus.completed });
                           setSelectedBooking(updatedBooking);
                         } catch (error) {
                           console.error('Failed to update booking status:', error);
                         }
                       }}
                       className="px-6 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                     >
                       <CheckCircleIcon className="w-4 h-4 mr-2" /> {t('common.complete')}
                     </button>
                   </div>
                 )}
                 {selectedBooking.status === 'cancelled' && (
                   <div className="flex justify-end space-x-3">
                     <button
                       onClick={async () => {
                         try {
                           const updatedBooking = await updateBookingStatus(selectedBooking.id, { status: BookingStatus.pending });
                           setSelectedBooking(updatedBooking);
                         } catch (error) {
                           console.error('Failed to update booking status:', error);
                         }
                       }}
                       className="px-6 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                     >
                       <ArrowRightIcon className="w-4 h-4 mr-2" /> {t('common.reopen')}
                     </button>
                   </div>
                 )}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <MobileOptimizedHeader
        title={business?.name || ''}
                  subtitle={currentTab === 'services' ? t('serviceDashboard.subtitle') : currentTab === 'bookings' ? t('bookings.list.subtitle') : t('business.management.settings')}
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
            label: t('business.dashboard.tabs.businessSettings'),
            isActive: currentTab === 'settings',
            onClick: () => setCurrentTab('settings')
          },
          {
            id: 'bookings',
            label: t('business.dashboard.tabs.bookings'),
            isActive: currentTab === 'bookings',
            onClick: () => setCurrentTab('bookings')
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
        {/* Page Description */}
        <div className="mb-6">
          <p className="text-gray-600 text-sm sm:text-base">
            {t('service.dashboard.description')}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {currentTab === 'services' && renderServicesTab()}
          {currentTab === 'settings' && renderSettingsTab()}
          {currentTab === 'bookings' && renderBookingsTab()}
        </motion.div>
      </main>

      {/* Service Create/Edit Modal */}
      <AnimatePresence>
        {(editingService || isCreateModalOpen) && (
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
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingService ? t('services.editService') : t('services.addService')}
                  </h3>
                  <button
                    onClick={closeServiceModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleServiceSubmit} className="p-6 space-y-6">
                {/* Success Message */}
                {showServiceSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3"
                  >
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">
                      {editingService ? t('services.success.updated') : t('services.success.created')}
                    </span>
                  </motion.div>
                )}

                {/* Error Message */}
                {serviceFormError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3"
                  >
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                    <span className="text-red-800 font-medium">{serviceFormError}</span>
                  </motion.div>
                )}

                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <TagIcon className="w-5 h-5 text-blue-600" />
                    <h4 className="text-md font-semibold text-gray-900">{t('serviceManagement.settings.basicInfo.title')}</h4>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label htmlFor="service_name" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('serviceManagement.settings.basicInfo.name.required')}
                      </label>
                      <input
                        type="text"
                        id="service_name"
                        name="name"
                        value={serviceFormData.name || ''}
                        onChange={handleServiceNameChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                                         <div>
                       <label htmlFor="service_slug" className="block text-sm font-medium text-gray-700 mb-2">
                         {t('serviceManagement.settings.basicInfo.slug')}
                       </label>
                       <input
                         type="text"
                         id="service_slug"
                         name="slug"
                         value={serviceFormData.slug || ''}
                         onChange={handleServiceInputChange}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                         placeholder="service-slug"
                       />
                       <p className="mt-1 text-xs text-gray-500">
                         {t('serviceManagement.settings.basicInfo.slug.help')}
                       </p>
                     </div>

                    <div>
                      <label htmlFor="service_description" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('serviceManagement.settings.basicInfo.description')}
                      </label>
                      <textarea
                        id="service_description"
                        name="description"
                        rows={3}
                        value={serviceFormData.description || ''}
                        onChange={handleServiceInputChange}
                        placeholder={t('serviceManagement.settings.basicInfo.description.placeholder')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing & Duration */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                    <h4 className="text-md font-semibold text-gray-900">{t('serviceManagement.settings.pricing.title')}</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="service_duration" className="block text-sm font-medium text-gray-700 mb-2">
                        <ClockIcon className="w-4 h-4 inline mr-1" />
                        {t('serviceManagement.settings.pricing.duration')}
                      </label>
                      <input
                        type="number"
                        id="service_duration"
                        name="duration_min"
                        min="1"
                        value={serviceFormData.duration_min || ''}
                        onChange={handleServiceInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {t('serviceManagement.settings.pricing.duration.help')}
                      </p>
                    </div>

                    <div>
                      <label htmlFor="service_price" className="block text-sm font-medium text-gray-700 mb-2">
                        <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
                        {t('serviceManagement.settings.pricing.price')}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="service_price"
                          name="price_minor"
                          min="0"
                          step="0.01"
                          value={serviceFormData.price_minor ? formatServicePrice(serviceFormData.price_minor) : ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            setServiceFormData(prev => ({
                              ...prev,
                              price_minor: value === '' ? 0 : Math.round(Number(value) * 100)
                            }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-sm">{business?.currency || 'ALL'}</span>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {t('serviceManagement.settings.pricing.price.help')}
                        {serviceFormData.price_minor === 0 && (
                          <span className="ml-2 font-medium text-green-600">
                            ({t('serviceManagement.settings.pricing.free')})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <UserGroupIcon className="w-5 h-5 text-purple-600" />
                    <h4 className="text-md font-semibold text-gray-900">{t('serviceManagement.settings.advanced.title')}</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="service_capacity" className="block text-sm font-medium text-gray-700 mb-2">
                        <UserGroupIcon className="w-4 h-4 inline mr-1" />
                        {t('serviceManagement.settings.advanced.capacity')}
                      </label>
                      <input
                        type="number"
                        id="service_capacity"
                        name="capacity"
                        min="1"
                        value={serviceFormData.capacity || ''}
                        onChange={handleServiceInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Optional"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {t('serviceManagement.settings.advanced.capacity.help')}
                      </p>
                    </div>

                    <div>
                      <label htmlFor="service_category" className="block text-sm font-medium text-gray-700 mb-2">
                        <TagIcon className="w-4 h-4 inline mr-1" />
                        {t('serviceManagement.settings.advanced.category')}
                      </label>
                      <select
                        id="service_category"
                        name="category_id"
                        value={serviceFormData.category_id || ''}
                        onChange={handleServiceInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={categoriesLoading}
                      >
                        <option value="">{t('serviceManagement.settings.advanced.category.placeholder')}</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {categoriesLoading && (
                        <p className="mt-1 text-sm text-gray-500">{t('serviceManagement.loadingCategories')}</p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        {t('serviceManagement.settings.advanced.status')}
                      </label>
                      <div className="flex items-center space-x-6">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="is_active"
                            checked={serviceFormData.is_active === true}
                            onChange={() => setServiceFormData(prev => ({ ...prev, is_active: true }))}
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
                            checked={serviceFormData.is_active === false}
                            onChange={() => setServiceFormData(prev => ({ ...prev, is_active: false }))}
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

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row sm:justify-end items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeServiceModal}
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {t('services.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={(serviceUpdating || serviceCreating) || !hasServiceChanges}
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {(serviceUpdating || serviceCreating) && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    {editingService ? t('serviceManagement.settings.save') : t('services.create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceDashboard; 