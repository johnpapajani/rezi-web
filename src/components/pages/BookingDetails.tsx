import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { BookingWithService, BookingStatus } from '../../types';
import { publicApi, bookingApi, businessApi } from '../../utils/api';
import MobileOptimizedHeader from '../shared/MobileOptimizedHeader';
import {
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowRightIcon,
  UserGroupIcon,
  TagIcon,
  CurrencyDollarIcon,
  ArrowLeftIcon,
  GlobeAltIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const BookingDetails: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { t, currentLanguage, setLanguage, languages } = useTranslation();

  const [booking, setBooking] = useState<BookingWithService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside language dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch booking details
  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setError(t('bookings.details.invalidId'));
        setLoading(false);
        return;
      }

      // Wait for authentication state to be determined
      if (authLoading) {
        return; // Keep loading while auth is being determined
      }

      try {
        // If user is authenticated, try to find the booking through their businesses
        if (isAuthenticated) {
          try {
            const businesses = await businessApi.listUserBusinesses();
            
            // Try to get booking details from each business
            for (const business of businesses) {
              try {
                const bookingData = await bookingApi.getBookingDetails(business.id, bookingId);
                setBooking(bookingData);
                setError(null);
                setLoading(false);
                return;
              } catch (businessErr) {
                // Continue to next business if booking not found in this one
                continue;
              }
            }
            
            // If not found in any business, show error
            setError(t('bookings.details.fetchError'));
          } catch (err: any) {
            console.error('Failed to fetch booking via business API:', err);
            setError(err.message || t('bookings.details.fetchError'));
          }
        } else {
          // For non-authenticated users, they need to sign in first
          setError(t('bookings.details.authRequired'));
        }
      } catch (err: any) {
        console.error('Failed to fetch booking details:', err);
        setError(err.message || t('bookings.details.fetchError'));
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, t, isAuthenticated, authLoading]);

  // Helper function to format date and time
  const formatDateTimeInBusinessTimezone = (dateTimeString: string): { date: string; time: string } => {
    const date = new Date(dateTimeString);
    
    // Map app language codes to locale identifiers
    const getLocale = (langCode: string) => {
      switch (langCode) {
        case 'sq': return 'sq-AL'; // Albanian (Albania)
        case 'en': return 'en-US'; // English (US)
        default: return 'en-US';
      }
    };
    
    const locale = getLocale(currentLanguage);
    
    const dateFormatter = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    const timeFormatter = new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    return {
      date: dateFormatter.format(date),
      time: timeFormatter.format(date)
    };
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

  // Handle booking status updates
  const handleStatusUpdate = async (newStatus: BookingStatus) => {
    if (!booking || !isAuthenticated) return;

    setUpdating(true);
    try {
      // Try to update via business API if we have business context
      const updatedBooking = await bookingApi.updateBooking(
        booking.business_id,
        booking.id,
        { status: newStatus }
      );
      setBooking(updatedBooking);
    } catch (err: any) {
      console.error('Failed to update booking status:', err);
      setError(err.message || t('bookings.details.updateError'));
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const goToDashboard = () => {
    if (booking?.business_id) {
      navigate(`/business/${booking.business_id}?tab=bookings`);
    } else {
      navigate('/dashboard');
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Language Selector Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex justify-end">
            <div className="relative" ref={languageDropdownRef}>
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors text-sm"
              >
                <GlobeAltIcon className="w-4 h-4" />
                <span>{languages.find(lang => lang.code === currentLanguage)?.flag}</span>
                <ChevronDownIcon className="w-3 h-3" />
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
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center max-w-md mx-auto p-6">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              {t('bookings.details.errorTitle')}
            </h1>
            <p className="text-red-600 mb-6">{error}</p>
            <div className="space-y-3">
              {isAuthenticated ? (
                <button
                  onClick={goToDashboard}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  {t('bookings.details.goToDashboard')}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate(`/signin?redirect=${encodeURIComponent(window.location.pathname)}`)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {t('auth.signIn')}
                  </button>
                  <p className="text-sm text-gray-600 text-center">
                    {t('bookings.details.signInToManage')}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  const { date, time } = formatDateTimeInBusinessTimezone(booking.starts_at);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <MobileOptimizedHeader
        title={t('bookings.details.title')}
        subtitle={`${t('bookings.details.subtitle')} #${booking.id.slice(-8).toUpperCase()}`}
        backUrl={isAuthenticated ? (booking.business_id ? `/business/${booking.business_id}?tab=bookings` : '/dashboard') : '/signin'}
        icon={CalendarDaysIcon}
        variant="business"
        showLanguageSelector={true}
        actions={isAuthenticated && booking.business_id ? [
          {
            label: t('bookings.details.viewAllBookings'),
            onClick: goToDashboard,
            variant: 'secondary',
            icon: ArrowLeftIcon
          }
        ] : []}
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Booking Status Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('bookings.details.status')}
              </h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                {t(`bookings.list.filters.${booking.status}`)}
              </span>
            </div>

            {/* Status-specific actions */}
            {isAuthenticated && (
              <div className="flex flex-wrap gap-3">
                {booking.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(BookingStatus.confirmed)}
                      disabled={updating}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      {t('common.confirm')}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(BookingStatus.cancelled)}
                      disabled={updating}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      <XMarkIcon className="w-4 h-4 mr-2" />
                      {t('common.cancel')}
                    </button>
                  </>
                )}
                {booking.status === 'confirmed' && (
                  <button
                    onClick={() => handleStatusUpdate(BookingStatus.completed)}
                    disabled={updating}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    {t('common.complete')}
                  </button>
                )}
                {booking.status === 'cancelled' && (
                  <button
                    onClick={() => handleStatusUpdate(BookingStatus.pending)}
                    disabled={updating}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                  >
                    <ArrowRightIcon className="w-4 h-4 mr-2" />
                    {t('common.reopen')}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <UserIcon className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('bookings.details.customerInfo')}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{booking.customer_name}</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {booking.customer_phone && (
                  <div className="flex items-center text-gray-600">
                    <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                    <a 
                      href={`tel:${booking.customer_phone}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {booking.customer_phone}
                    </a>
                  </div>
                )}
                
                {booking.customer_email && (
                  <div className="flex items-center text-gray-600">
                    <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                    <a 
                      href={`mailto:${booking.customer_email}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {booking.customer_email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <CalendarDaysIcon className="w-5 h-5 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('bookings.details.bookingInfo')}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('bookings.details.service')}
                </label>
                <div className="flex items-center">
                  <TagIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-lg font-semibold text-gray-900">{booking.service_name}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('bookings.details.dateTime')}
                </label>
                <div className="space-y-1">
                  <div className="flex items-center">
                    <CalendarDaysIcon className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-lg font-semibold text-gray-900">{date}</span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-lg font-semibold text-gray-900">{time}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('bookings.details.partySize')}
                </label>
                <div className="flex items-center">
                  <UserGroupIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-lg font-semibold text-gray-900">
                    {booking.party_size} {booking.party_size === 1 ? t('bookings.list.person') : t('bookings.list.people')}
                  </span>
                </div>
              </div>

              {booking.service_duration_min && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('bookings.details.duration')}
                  </label>
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-lg font-semibold text-gray-900">{formatDuration(booking.service_duration_min)}</span>
                  </div>
                </div>
              )}

              {booking.service_price_minor !== undefined && booking.service_price_minor > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('bookings.details.price')}
                  </label>
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-lg font-semibold text-gray-900">
                      {formatPrice(booking.service_price_minor, 'ALL')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Business Information */}
          {booking.business_id && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <BuildingStorefrontIcon className="w-5 h-5 text-purple-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('bookings.details.businessInfo')}
                </h2>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Business ID: {booking.business_id}</h3>
                {isAuthenticated && (
                  <button
                    onClick={goToDashboard}
                    className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {t('bookings.details.manageBusiness')} →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Authentication prompt for non-authenticated users */}
          {!isAuthenticated && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">
                    {t('bookings.details.authRequired')}
                  </h3>
                  <p className="text-sm text-blue-700 mb-3">
                    {t('bookings.details.authRequiredDesc')}
                  </p>
                  <button
                    onClick={() => navigate('/signin')}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {t('auth.signIn')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default BookingDetails; 