import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  CurrencyEuroIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { useBookings } from '../../hooks/useBookings';
import { useTranslation } from '../../hooks/useTranslation';
import { BookingWithService, BookingStatus, BookingFilters } from '../../types';
import BusinessTabNavigation from '../shared/BusinessTabNavigation';

const BookingList: React.FC = () => {
  const { bizId } = useParams<{ bizId: string }>();
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();
  const { bookings, loading, error, searchBookings, updateBookingStatus, cancelBooking } = useBookings({ bizId: bizId || '' });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
  const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'week' | 'month' | ''>('');
  const [selectedBooking, setSelectedBooking] = useState<BookingWithService | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'settings' | 'services' | 'tables' | 'bookings' | 'calendar'>('bookings');

  // Locale mapping helper
  const getLocale = (langCode: string) => {
    switch (langCode) {
      case 'sq': return 'sq-AL'; // Albanian (Albania)
      case 'en': return 'en-US'; // English (US)
      default: return 'en-US';
    }
  };

  const handleTabChange = (tab: 'dashboard' | 'settings' | 'services' | 'tables' | 'bookings' | 'calendar') => {
    setCurrentTab(tab);
  };

  // Load bookings on component mount
  useEffect(() => {
    if (bizId) {
      searchBookings();
    }
  }, [bizId, searchBookings]);

  // Apply filters
  useEffect(() => {
    if (!bizId) return;

    const filters: BookingFilters = {};
    
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
    return date.toLocaleDateString(getLocale(currentLanguage), { 
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
                <h1 className="text-2xl font-bold text-gray-900">{t('bookings.list.title')}</h1>
                <p className="text-sm text-gray-600">{t('bookings.list.subtitle')}</p>
              </div>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <BusinessTabNavigation 
            bizId={bizId || ''} 
            currentTab={currentTab} 
            onTabChange={handleTabChange} 
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div></div>
          <div className="mt-4 sm:mt-0">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Booking
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                                  placeholder={t('bookings.list.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BookingStatus)}
              className="block w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t('bookings.list.filters.allStatuses')}</option>
              <option value="pending">{t('bookings.list.filters.pending')}</option>
              <option value="confirmed">{t('bookings.list.filters.confirmed')}</option>
              <option value="completed">{t('bookings.list.filters.completed')}</option>
              <option value="cancelled">{t('bookings.list.filters.cancelled')}</option>
              <option value="no_show">{t('bookings.list.filters.noShow')}</option>
              <option value="rescheduled">{t('bookings.list.filters.rescheduled')}</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="block w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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

      {/* Booking Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarDaysIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('bookings.list.stats.totalBookings')}</dt>
                  <dd className="text-lg font-medium text-gray-900">{bookings.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('bookings.list.stats.confirmed')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {bookings.filter(b => b.status === BookingStatus.confirmed).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('bookings.list.stats.pending')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {bookings.filter(b => b.status === BookingStatus.pending).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyEuroIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('bookings.list.stats.revenue')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    €{((bookings.reduce((sum, b) => sum + (b.service_price_minor || 0), 0)) / 100).toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {t('bookings.list.title')} ({bookings.length})
          </h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {bookings.map((booking) => (
            <motion.li
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-4 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserIcon className="h-10 w-10 text-gray-400" />
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">{booking.customer_name}</p>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <CalendarDaysIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                      {formatDate(booking.starts_at)}
                      {booking.service_name && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{booking.service_name}</span>
                        </>
                      )}
                      <span className="mx-2">•</span>
                      <UserIcon className="flex-shrink-0 mr-1 h-4 w-4" />
                      {booking.party_size} {booking.party_size === 1 ? t('bookings.list.person') : t('bookings.list.people')}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      {booking.customer_phone && (
                        <div className="flex items-center mr-4">
                          <PhoneIcon className="flex-shrink-0 mr-1 h-4 w-4" />
                          {booking.customer_phone}
                        </div>
                      )}
                      {booking.customer_email && (
                        <div className="flex items-center">
                          <EnvelopeIcon className="flex-shrink-0 mr-1 h-4 w-4" />
                          {booking.customer_email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  {booking.service_price_minor && (
                    <div className="text-sm font-medium text-gray-900 mr-4">
                      {formatPrice(booking.service_price_minor)}
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowBookingDetails(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        // TODO: Implement edit functionality
                      }}
                      className="text-green-600 hover:text-green-800"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    {booking.status !== BookingStatus.cancelled && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
        
        {bookings.length === 0 && (
          <div className="text-center py-12">
            <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('bookings.list.noBookings')}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('bookings.list.noBookingsDescription')}
            </p>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showBookingDetails && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">{t('bookings.details.title')}</h3>
              <button
                onClick={() => setShowBookingDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('bookings.details.status')}</label>
                <select
                  value={selectedBooking.status}
                  onChange={(e) => handleStatusChange(selectedBooking.id, e.target.value as BookingStatus)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">{t('bookings.list.filters.pending')}</option>
                  <option value="confirmed">{t('bookings.list.filters.confirmed')}</option>
                  <option value="completed">{t('bookings.list.filters.completed')}</option>
                  <option value="cancelled">{t('bookings.list.filters.cancelled')}</option>
                  <option value="no_show">{t('bookings.list.filters.noShow')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('bookings.details.customer')}</label>
                <p className="mt-1 text-sm text-gray-900">{selectedBooking.customer_name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('bookings.details.dateTime')}</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(selectedBooking.starts_at)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('bookings.details.partySize')}</label>
                <p className="mt-1 text-sm text-gray-900">{selectedBooking.party_size}</p>
              </div>
              
              {selectedBooking.service_name && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('bookings.details.service')}</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking.service_name}</p>
                </div>
              )}
              
              {selectedBooking.customer_phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('bookings.details.phone')}</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking.customer_phone}</p>
                </div>
              )}
              
              {selectedBooking.customer_email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('bookings.details.email')}</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking.customer_email}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowBookingDetails(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                {t('bookings.details.close')}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default BookingList; 