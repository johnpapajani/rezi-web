import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDaysIcon,
  ChartBarIcon,
  CurrencyEuroIcon,
  UserIcon,
  ClockIcon,
  ArrowLeftIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  ChevronDownIcon,
  RectangleGroupIcon,
  CogIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingStorefrontIcon,
  PhotoIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useBusiness } from '../../hooks/useBusiness';
import { useBookings, useUpcomingBookings, useCalendarBookings } from '../../hooks/useBookings';
import { useTranslation } from '../../hooks/useTranslation';
import { useTables } from '../../hooks/useTables';
import { useServices } from '../../hooks/useServices';
import UpcomingBookings from '../dashboard/UpcomingBookings';
import { BookingStatus, Table, TableCreate, TableUpdate, BookingWithService, BusinessUpdate } from '../../types';

// Wrapper components that remove headers
const BookingListWrapper: React.FC = () => {
  const { bizId } = useParams<{ bizId: string }>();
  const { t } = useTranslation();
  const { bookings, loading, error, searchBookings, updateBookingStatus, cancelBooking } = useBookings({ bizId: bizId || '' });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
  const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'week' | 'month' | ''>('');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);

  // Load bookings on component mount
  useEffect(() => {
    if (bizId) {
      searchBookings();
    }
  }, [bizId, searchBookings]);

  // Apply filters
  useEffect(() => {
    if (!bizId) return;

    const filters: any = {};
    
    if (searchTerm) {
      filters.customer_name = searchTerm;
    }
    
    if (statusFilter) {
      filters.status = statusFilter;
    }

    if (dateFilter) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      switch (dateFilter) {
        case 'today':
          filters.date_from = today.toISOString().split('T')[0];
          filters.date_to = today.toISOString().split('T')[0];
          break;
        case 'tomorrow':
          filters.date_from = tomorrow.toISOString().split('T')[0];
          filters.date_to = tomorrow.toISOString().split('T')[0];
          break;
        case 'week':
          const weekEnd = new Date(today);
          weekEnd.setDate(weekEnd.getDate() + 7);
          filters.date_from = today.toISOString().split('T')[0];
          filters.date_to = weekEnd.toISOString().split('T')[0];
          break;
        case 'month':
          const monthEnd = new Date(today);
          monthEnd.setMonth(monthEnd.getMonth() + 1);
          filters.date_from = today.toISOString().split('T')[0];
          filters.date_to = monthEnd.toISOString().split('T')[0];
          break;
      }
    }

    searchBookings(filters);
  }, [searchTerm, statusFilter, dateFilter, bizId, searchBookings]);

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      await updateBookingStatus(bookingId, { status: newStatus });
    } catch (error) {
      console.error('Failed to update booking status:', error);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm(t('bookings.list.confirmCancel'))) {
      try {
        await cancelBooking(bookingId);
      } catch (error) {
        console.error('Failed to cancel booking:', error);
      }
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.confirmed:
        return 'bg-green-100 text-green-800';
      case BookingStatus.pending:
        return 'bg-yellow-100 text-yellow-800';
      case BookingStatus.cancelled:
        return 'bg-red-100 text-red-800';
      case BookingStatus.completed:
        return 'bg-blue-100 text-blue-800';
      case BookingStatus.no_show:
        return 'bg-gray-100 text-gray-800';
      case BookingStatus.rescheduled:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (priceMinor?: number) => {
    if (!priceMinor) return 'N/A';
    return `€${(priceMinor / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => searchBookings()}
          className="text-blue-600 hover:text-blue-800"
        >
          {t('bookings.list.tryAgain')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder={t('bookings.list.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BookingStatus | '')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t('bookings.list.filters.allStatuses')}</option>
              <option value={BookingStatus.pending}>{t('bookings.list.filters.pending')}</option>
              <option value={BookingStatus.confirmed}>{t('bookings.list.filters.confirmed')}</option>
              <option value={BookingStatus.completed}>{t('bookings.list.filters.completed')}</option>
              <option value={BookingStatus.cancelled}>{t('bookings.list.filters.cancelled')}</option>
              <option value={BookingStatus.no_show}>{t('bookings.list.filters.noShow')}</option>
              <option value={BookingStatus.rescheduled}>{t('bookings.list.filters.rescheduled')}</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t('bookings.list.filters.allDates')}</option>
              <option value="today">{t('bookings.list.filters.today')}</option>
              <option value="tomorrow">{t('bookings.list.filters.tomorrow')}</option>
              <option value="week">{t('bookings.list.filters.thisWeek')}</option>
              <option value="month">{t('bookings.list.filters.thisMonth')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {t('bookings.list.title')} ({bookings.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">{t('bookings.list.noBookings')}</h3>
              <p className="mt-1 text-sm text-gray-500">{t('bookings.list.noBookingsDescription')}</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">{booking.customer_name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>{formatDate(booking.starts_at)}</span>
                      <span>{booking.party_size} {booking.party_size === 1 ? t('bookings.list.person') : t('bookings.list.people')}</span>
                      {booking.service_name && <span>{booking.service_name}</span>}
                      {booking.service_price_minor && <span>{formatPrice(booking.service_price_minor)}</span>}
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      {booking.customer_phone && (
                        <span className="flex items-center">
                          <PhoneIcon className="w-4 h-4 mr-1" />
                          {booking.customer_phone}
                        </span>
                      )}
                      {booking.customer_email && (
                        <span className="flex items-center">
                          <EnvelopeIcon className="w-4 h-4 mr-1" />
                          {booking.customer_email}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {t('bookings.list.actions.viewDetails')}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const BookingCalendarWrapper: React.FC = () => {
  const { bizId } = useParams<{ bizId: string }>();
  const { t } = useTranslation();
  const { calendarBookings, loading, error, fetchCalendarBookings } = useCalendarBookings({ bizId: bizId || '' });
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  // Generate calendar days for month view
  const generateCalendarDays = () => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDay = start.getDay();
    
    const days: Date[] = [];
    
    // Add previous month's trailing days
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(start);
      date.setDate(date.getDate() - (i + 1));
      days.push(date);
    }
    
    // Add current month's days
    for (let i = 1; i <= end.getDate(); i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }
    
    // Add next month's leading days
    const totalCells = Math.ceil(days.length / 7) * 7;
    for (let i = days.length; i < totalCells; i++) {
      const date = new Date(end);
      date.setDate(date.getDate() + (i - days.length + 1));
      days.push(date);
    }
    
    return days;
  };

  // Load bookings based on current view
  useEffect(() => {
    if (bizId) {
      let start: Date, end: Date;
      
      switch (viewMode) {
        case 'month':
          start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
          break;
        case 'week':
          const weekStart = new Date(currentDate);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          start = weekStart;
          end = weekEnd;
          break;
        case 'day':
          start = new Date(currentDate);
          start.setHours(0, 0, 0, 0);
          end = new Date(currentDate);
          end.setHours(23, 59, 59, 999);
          break;
        default:
          start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      }
      
      fetchCalendarBookings(start.toISOString(), end.toISOString());
    }
  }, [bizId, currentDate, viewMode, fetchCalendarBookings]);

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return calendarBookings.filter(booking => 
      booking.starts_at.split('T')[0] === dateStr
    );
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.confirmed:
        return 'bg-green-500';
      case BookingStatus.pending:
        return 'bg-yellow-500';
      case BookingStatus.cancelled:
        return 'bg-red-500';
      case BookingStatus.completed:
        return 'bg-blue-500';
      case BookingStatus.no_show:
        return 'bg-gray-500';
      case BookingStatus.rescheduled:
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  const navigate_ = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'month':
        if (direction === 'prev') {
          newDate.setMonth(newDate.getMonth() - 1);
        } else {
          newDate.setMonth(newDate.getMonth() + 1);
        }
        break;
      case 'week':
        if (direction === 'prev') {
          newDate.setDate(newDate.getDate() - 7);
        } else {
          newDate.setDate(newDate.getDate() + 7);
        }
        break;
      case 'day':
        if (direction === 'prev') {
          newDate.setDate(newDate.getDate() - 1);
        } else {
          newDate.setDate(newDate.getDate() + 1);
        }
        break;
    }
    
    setCurrentDate(newDate);
  };

  const getViewTitle = () => {
    switch (viewMode) {
      case 'month':
        return currentDate.toLocaleDateString(undefined, { 
          year: 'numeric', 
          month: 'long' 
        });
      case 'week':
        const weekStart = new Date(currentDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
      case 'day':
        return currentDate.toLocaleDateString(undefined, { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      default:
        return currentDate.toLocaleDateString();
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth() && 
           date.getFullYear() === currentDate.getFullYear();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => fetchCalendarBookings()}
          className="text-blue-600 hover:text-blue-800"
        >
          {t('bookings.calendar.tryAgain')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate_('prev')}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">{getViewTitle()}</h2>
            <button
              onClick={() => navigate_('next')}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeftIcon className="w-5 h-5 transform rotate-180" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                viewMode === 'month' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('bookings.calendar.viewModes.month')}
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                viewMode === 'week' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('bookings.calendar.viewModes.week')}
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                viewMode === 'day' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('bookings.calendar.viewModes.day')}
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {generateCalendarDays().map((date, index) => {
            const bookings = getBookingsForDate(date);
            const isTodayDate = isToday(date);
            const isCurrentMonthDate = isCurrentMonth(date);
            
            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 ${
                  isCurrentMonthDate ? 'bg-white' : 'bg-gray-50'
                } ${isTodayDate ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className={`text-sm font-medium ${
                  isCurrentMonthDate ? 'text-gray-900' : 'text-gray-400'
                } ${isTodayDate ? 'text-blue-600' : ''}`}>
                  {date.getDate()}
                </div>
                <div className="mt-1 space-y-1">
                  {bookings.slice(0, 3).map((booking) => (
                    <div
                      key={booking.id}
                      className={`text-xs p-1 rounded truncate ${getStatusColor(booking.status)} text-white`}
                      title={`${booking.customer_name} - ${formatTime(booking.starts_at)}`}
                    >
                      {booking.customer_name}
                    </div>
                  ))}
                  {bookings.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{bookings.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Settings Wrapper Component
const SettingsWrapper: React.FC = () => {
  const { bizId } = useParams<{ bizId: string }>();
  const { t } = useTranslation();
  const { business, loading, error, updating, updateBusiness } = useBusiness({ 
    bizId: bizId || '' 
  });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('business.management.error.title')}</h2>
        <p className="text-red-600 mb-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
    </div>
  );
};

type TabType = 'dashboard' | 'settings' | 'services' | 'tables' | 'bookings' | 'calendar';

const BusinessDashboard: React.FC = () => {
  const { bizId } = useParams<{ bizId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const selectedServiceId = searchParams.get('service');
  const { t, currentLanguage, setLanguage, languages } = useTranslation();
  const { business, loading: businessLoading, error: businessError } = useBusiness({ bizId: bizId || '' });
  const { bookings, loading: bookingsLoading, searchBookings } = useBookings({ bizId: bizId || '' });
  const { services, loading: servicesLoading } = useServices({ bizId: bizId || '' });

  // Get the selected service
  const selectedService = services.find(service => service.id === selectedServiceId);
  const { 
    tables, 
    loading: tablesLoading, 
    error: tablesError, 
    creating, 
    updating, 
    deleting,
    createTable, 
    updateTable, 
    deleteTable 
  } = useTables({ bizId: bizId || '' });
  
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [deletingTable, setDeletingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState<TableCreate>({
    service_id: '',
    code: '',
    seats: 2,
    merge_group: '',
    is_active: true
  });

  // Determine current tab from URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/settings')) setCurrentTab('settings');
    else if (path.includes('/bookings')) setCurrentTab('bookings');
    else if (path.includes('/calendar')) setCurrentTab('calendar');
    else if (path.includes('/tables')) setCurrentTab('tables');
    else setCurrentTab('dashboard');
  }, [location.pathname]);

  // Load recent bookings (last 30 days)
  useEffect(() => {
    if (bizId) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      searchBookings({
        date_from: thirtyDaysAgo.toISOString(),
        limit: 100
      });
    }
  }, [bizId, searchBookings]);

  // Table management handlers
  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTable(formData);
      setIsCreateModalOpen(false);
      setFormData({ service_id: '', code: '', seats: 2, merge_group: '', is_active: true });
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleUpdateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable) return;
    
    try {
      await updateTable(editingTable.id, formData);
      setEditingTable(null);
      setFormData({ service_id: '', code: '', seats: 2, merge_group: '', is_active: true });
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleDeleteTable = async () => {
    if (!deletingTable) return;
    
    try {
      await deleteTable(deletingTable.id);
      setDeletingTable(null);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const openEditModal = (table: Table) => {
    setEditingTable(table);
    setFormData({
      service_id: table.service_id || '',
      code: table.code,
      seats: table.seats,
      merge_group: table.merge_group || '',
      is_active: table.is_active
    });
  };

  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab);
    // Update URL without full navigation
    const newPath = tab === 'dashboard' 
      ? `/business/${bizId}` 
      : `/business/${bizId}/${tab}`;
    navigate(newPath, { replace: true });
  };

  // Calculate metrics
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === BookingStatus.confirmed).length;
  const pendingBookings = bookings.filter(b => b.status === BookingStatus.pending).length;
  const completedBookings = bookings.filter(b => b.status === BookingStatus.completed).length;
  const totalRevenue = bookings
    .filter(b => b.status === BookingStatus.completed)
    .reduce((sum, b) => sum + (b.service_price_minor || 0), 0);

  // Calculate today's bookings
  const today = new Date().toISOString().split('T')[0];
  const todaysBookings = bookings.filter(b => 
    b.starts_at.split('T')[0] === today
  ).length;

  // Calculate this week's bookings
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const thisWeekBookings = bookings.filter(b => 
    new Date(b.starts_at) >= startOfWeek
  ).length;

  if (!bizId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('business.dashboard.error.businessIdRequired')}</h2>
          <p className="text-gray-600 mb-4">{t('business.dashboard.error.businessIdRequiredDesc')}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {t('business.dashboard.error.return')}
          </button>
        </div>
      </div>
    );
  }

  if (businessLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('business.dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  if (businessError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('business.dashboard.error.loadingBusiness')}</h2>
          <p className="text-red-600 mb-4">{businessError}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {t('business.dashboard.error.return')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{business?.name}</h1>
                <p className="text-sm text-gray-600">{t('business.dashboard.title')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
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

              {currentTab === 'dashboard' && (
                <>
                  {/* Removed View All Bookings and Calendar buttons */}
                </>
              )}

              {/* Removed Manage Tables button */}
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="mt-4 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => handleTabChange('dashboard')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  currentTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('business.dashboard.tabs.dashboard')}
              </button>
              <button
                onClick={() => handleTabChange('settings')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  currentTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('business.dashboard.tabs.settings')}
              </button>
              <button
                onClick={() => handleTabChange('tables')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  currentTab === 'tables'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('business.dashboard.tabs.tables')}
              </button>
              <button
                onClick={() => handleTabChange('bookings')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  currentTab === 'bookings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('business.dashboard.tabs.bookings')}
              </button>
              <button
                onClick={() => handleTabChange('calendar')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  currentTab === 'calendar'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('business.dashboard.tabs.calendar')}
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {currentTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{t('business.dashboard.metrics.totalBookings')}</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {bookingsLoading ? (
                          <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                        ) : (
                          totalBookings
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{t('business.dashboard.metrics.todaysBookings')}</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {bookingsLoading ? (
                          <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                        ) : (
                          todaysBookings
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <ClockIcon className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{t('business.dashboard.metrics.pending')}</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {bookingsLoading ? (
                          <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                        ) : (
                          pendingBookings
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <CurrencyEuroIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{t('business.dashboard.metrics.revenue')}</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {bookingsLoading ? (
                          <div className="animate-pulse bg-gray-200 h-6 w-12 rounded"></div>
                        ) : (
                          `€${(totalRevenue / 100).toFixed(2)}`
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Dashboard Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming Bookings */}
                <div className="lg:col-span-2">
                  <UpcomingBookings bizId={bizId} />
                </div>

                {/* Quick Stats */}
                <div className="space-y-6">
                  {/* This Week */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{t('business.dashboard.thisWeek.title')}</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t('business.dashboard.thisWeek.totalBookings')}</span>
                        <span className="text-lg font-semibold text-gray-900">
                          {bookingsLoading ? (
                            <div className="animate-pulse bg-gray-200 h-5 w-6 rounded"></div>
                          ) : (
                            thisWeekBookings
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t('business.dashboard.thisWeek.confirmed')}</span>
                        <span className="text-lg font-semibold text-green-600">
                          {bookingsLoading ? (
                            <div className="animate-pulse bg-gray-200 h-5 w-6 rounded"></div>
                          ) : (
                            bookings.filter(b => 
                              new Date(b.starts_at) >= new Date(new Date().setDate(new Date().getDate() - new Date().getDay())) &&
                              b.status === BookingStatus.confirmed
                            ).length
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t('business.dashboard.thisWeek.completed')}</span>
                        <span className="text-lg font-semibold text-blue-600">
                          {bookingsLoading ? (
                            <div className="animate-pulse bg-gray-200 h-5 w-6 rounded"></div>
                          ) : (
                            bookings.filter(b => 
                              new Date(b.starts_at) >= new Date(new Date().setDate(new Date().getDate() - new Date().getDay())) &&
                              b.status === BookingStatus.completed
                            ).length
                          )}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{t('business.dashboard.quickActions.title')}</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => handleTabChange('bookings')}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <PlusIcon className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900">{t('business.dashboard.quickActions.newBooking.title')}</p>
                            <p className="text-sm text-gray-500">{t('business.dashboard.quickActions.newBooking.description')}</p>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => handleTabChange('calendar')}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <CalendarDaysIcon className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium text-gray-900">{t('business.dashboard.quickActions.viewCalendar.title')}</p>
                            <p className="text-sm text-gray-500">{t('business.dashboard.quickActions.viewCalendar.description')}</p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleTabChange('settings')}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <CogIcon className="w-5 h-5 text-purple-600" />
                          <div>
                            <p className="font-medium text-gray-900">{t('business.dashboard.quickActions.settings.title')}</p>
                            <p className="text-sm text-gray-500">{t('business.dashboard.quickActions.settings.description')}</p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleTabChange('tables')}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <RectangleGroupIcon className="w-5 h-5 text-orange-600" />
                          <div>
                            <p className="font-medium text-gray-900">{t('tables.manageTables')}</p>
                            <p className="text-sm text-gray-500">{t('tables.configureTables')}</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {currentTab === 'tables' && (
            <motion.div
              key="tables"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Error Display */}
              {tablesError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                    <span className="text-red-800 font-medium">Error: {tablesError}</span>
                  </div>
                </div>
              )}

              {/* Tables Grid */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      {t('tables.title')} ({tables.length})
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {t('tables.subtitle')}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    {t('tables.addTable')}
                  </button>
                </div>

                {tablesLoading ? (
                  <div className="p-6">
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                            <div className="flex-1">
                              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : tables.length === 0 ? (
                  <div className="text-center py-12">
                    <RectangleGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">{t('tables.noTables')}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {t('tables.noTablesDescription')}
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        {t('tables.addTable')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {tables.map((table) => (
                      <motion.div
                        key={table.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${table.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            <h3 className="text-lg font-medium text-gray-900">{table.code}</h3>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openEditModal(table)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingTable(table)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">{t('tables.seatsLabel')}</span>
                            <span className="font-medium text-gray-900">{table.seats}</span>
                          </div>
                          {table.merge_group && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">{t('tables.mergeGroupLabel')}</span>
                              <span className="font-medium text-gray-900">{table.merge_group}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">{t('tables.status')}:</span>
                            <span className={`font-medium ${table.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                              {table.is_active ? t('tables.statusActive') : t('tables.statusInactive')}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {currentTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SettingsWrapper />
            </motion.div>
          )}

          {currentTab === 'bookings' && (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BookingListWrapper />
            </motion.div>
          )}

          {currentTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BookingCalendarWrapper />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(isCreateModalOpen || editingTable) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => {
              setIsCreateModalOpen(false);
              setEditingTable(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingTable ? t('tables.editTable') : t('tables.createTable')}
                </h3>
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingTable(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={editingTable ? handleUpdateTable : handleCreateTable} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('tables.tableCode')}
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t('tables.tableCodePlaceholder')}
                    required
                    maxLength={40}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('tables.seats')}
                  </label>
                  <input
                    type="number"
                    value={formData.seats}
                    onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('tables.mergeGroup')}
                  </label>
                  <input
                    type="text"
                    value={formData.merge_group}
                    onChange={(e) => setFormData({ ...formData, merge_group: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t('tables.mergeGroupPlaceholder')}
                    maxLength={40}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {t('tables.mergeGroupHelp')}
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                    {t('tables.active')}
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setEditingTable(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {t('tables.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={creating || updating}
                    className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating || updating ? t('tables.saving') : (editingTable ? t('tables.update') : t('tables.create'))}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingTable && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setDeletingTable(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {t('tables.deleteTable')}
                  </h3>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-500">
                  {t('tables.confirmDelete')} <strong>{deletingTable.code}</strong>? 
                  {t('tables.confirmDeleteDescription')}
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setDeletingTable(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t('tables.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteTable}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? t('tables.deleting') : t('tables.delete')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BusinessDashboard; 