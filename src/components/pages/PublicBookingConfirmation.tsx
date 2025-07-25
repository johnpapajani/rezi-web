import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { publicApi } from '../../utils/api';
import { Business, ServiceWithOpenIntervals, BookingWithService, BookingStatus } from '../../types';
import { formatTimeInTimezone, formatDateTimeInTimezone } from '../../utils/timezone';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  CheckCircleIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  XCircleIcon,
  GlobeAltIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const PublicBookingConfirmation: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, currentLanguage, setLanguage, languages } = useTranslation();
  
  // Get data passed from the previous page if available
  const stateData = location.state as {
    booking: BookingWithService;
    service: ServiceWithOpenIntervals;
    business: Business;
  } || null;

  const [booking, setBooking] = useState<BookingWithService | null>(stateData?.booking || null);
  const [business, setBusiness] = useState<Business | null>(stateData?.business || null);
  const [service, setService] = useState<ServiceWithOpenIntervals | null>(stateData?.service || null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  useEffect(() => {
    const fetchBookingData = async () => {
      if (!bookingId) {
        setError(t('public.confirmation.bookingDetailsNotAvailable'));
        setLoading(false);
        return;
      }

      // If we already have state data, check if we need to refresh it
      if (stateData?.booking) {
        // Use state data initially but still fetch fresh data to ensure status is current
        if (stateData.booking.customer_phone) {
          try {
            const freshBookingData = await publicApi.getBookingDetails(bookingId!, stateData.booking.customer_phone);
            setBooking(freshBookingData);
          } catch (err: any) {
            // If fresh fetch fails, keep using state data
            console.warn('Failed to fetch fresh booking data, using state data:', err);
          }
        }
        setLoading(false);
        return;
      }

      // No state data - try booking lookup by ID first (for email confirmation links)
      try {
        const bookingData = await publicApi.getBookingDetailsById(bookingId!);
        setBooking(bookingData);
        
        // Try to fetch business data if we have business_id
        if (bookingData.business_id) {
          try {
            // We need the business slug to fetch business details
            // For now, we'll just set the business data to null
            // In a production app, you might want to add a separate API endpoint
            setBusiness(null);
          } catch (businessErr) {
            console.warn('Failed to fetch business data:', businessErr);
          }
        }
        setLoading(false);
        return;
      } catch (err: any) {
        console.warn('Booking lookup by ID failed, trying phone verification:', err);
        
        // If booking lookup by ID fails, try phone verification
        const urlParams = new URLSearchParams(location.search);
        const phoneParam = urlParams.get('phone');
        
        if (!phoneParam) {
          setError(t('public.confirmation.bookingNotFound') + '. If you have the phone number used for this booking, you can add ?phone=YOUR_PHONE_NUMBER to the URL to verify access.');
          setLoading(false);
          return;
        }

        try {
          const bookingData = await publicApi.getBookingDetails(bookingId!, phoneParam);
          setBooking(bookingData);
          
          // Try to fetch business data if we have business_id
          if (bookingData.business_id) {
            try {
              // We need the business slug to fetch business details
              // For now, we'll just set the business data to null
              // In a production app, you might want to add a separate API endpoint
              setBusiness(null);
            } catch (businessErr) {
              console.warn('Failed to fetch business data:', businessErr);
            }
          }
        } catch (phoneErr: any) {
          setError(phoneErr.detail || t('public.error.loadingFailed'));
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBookingData();
  }, [bookingId, stateData, location.search]);

  const formatPrice = (priceMinor: number | undefined, currency: string = 'ALL') => {
    if (priceMinor === undefined || priceMinor === null || priceMinor <= 0) return '';
    const price = priceMinor / 100;
    const locale = currentLanguage === 'sq' ? 'sq-AL' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatTime = (timeString: string) => {
    const businessTimezone = business?.timezone || 'UTC';
    const locale = currentLanguage === 'sq' ? 'sq-AL' : 'en-US';
    return formatTimeInTimezone(timeString, businessTimezone, locale);
  };

  const formatDateTime = (timeString: string) => {
    const businessTimezone = business?.timezone || 'UTC';
    const locale = currentLanguage === 'sq' ? 'sq-AL' : 'en-US';
    return formatDateTimeInTimezone(timeString, businessTimezone, locale);
  };

  const formatDate = (date: Date) => {
    if (currentLanguage === 'sq') {
      // Use Albanian translations for month and day names
      const monthNames = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
      ];
      const dayNames = [
        'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
      ];
      
      const monthKey = `public.calendar.months.${monthNames[date.getMonth()]}`;
      const weekdayKey = `public.calendar.weekdays.full.${dayNames[date.getDay()]}`;
      
      return {
        month: t(monthKey),
        weekday: t(weekdayKey),
        day: date.getDate(),
        year: date.getFullYear()
      };
    } else {
      // Use English formatting
      return {
        month: date.toLocaleDateString('en-US', { month: 'long' }),
        weekday: date.toLocaleDateString('en-US', { weekday: 'long' }),
        day: date.getDate(),
        year: date.getFullYear()
      };
    }
  };

  const copyBookingId = () => {
    if (booking?.id) {
      navigator.clipboard.writeText(booking.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareBooking = () => {
    if (navigator.share && booking) {
      // Use current URL - if booking is accessible by ID alone, keep it simple
      // If phone was needed, it's already in the URL
      const shareUrl = window.location.href;
      
      navigator.share({
        title: 'Booking Confirmation',
        text: `Booking confirmed for ${booking.service_name} on ${formatDateTime(booking.starts_at)}`,
        url: shareUrl
      });
    } else {
      // Fallback to copying current URL
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking?.id) return;

    try {
      setCanceling(true);
      
      let canceledBooking;
      
      // Try canceling by ID first
      try {
        canceledBooking = await publicApi.cancelBookingById(booking.id);
      } catch (err: any) {
        // If ID-only cancellation fails, try with phone verification
        if (booking.customer_phone) {
          canceledBooking = await publicApi.cancelBooking(booking.id, booking.customer_phone);
        } else {
          throw err; // Re-throw the original error if no phone available
        }
      }
      
      // Ensure the booking status is set to cancelled
      const updatedBooking = {
        ...canceledBooking,
        status: BookingStatus.cancelled
      };
      
      setBooking(updatedBooking);
      setShowCancelConfirm(false);
      setError(null); // Clear any previous errors
    } catch (err: any) {
      setError(err.detail || t('public.error.cancelBookingFailed'));
    } finally {
      setCanceling(false);
    }
  };

  const canCancelBooking = () => {
    if (!booking) return false;
    if (booking.status !== 'confirmed' && booking.status !== 'pending') return false;
    
    // Check if booking is more than 1 hour in the future
    const now = new Date();
    const bookingTime = new Date(booking.starts_at);
    const timeDiff = bookingTime.getTime() - now.getTime();
    const hoursUntilBooking = timeDiff / (1000 * 60 * 60);
    
    return hoursUntilBooking > 1;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('public.confirmation.bookingNotFound')}</h2>
          <p className="text-gray-600 mb-4">{error || t('public.confirmation.bookingNotFoundMessage')}</p>
          <div className="space-x-4">
            <Link to="/booking-search" className="text-blue-600 hover:text-blue-800 font-medium">
              {t('public.confirmation.searchForBooking')}
            </Link>
            <span className="text-gray-400">|</span>
            <Link to={business?.slug ? `/book/${business.slug}` : "/"} className="text-blue-600 hover:text-blue-800 font-medium">
              {t('public.confirmation.goBackHome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-gray-900">{t('public.confirmation.title')}</h1>
              <p className="text-gray-600">{t('public.confirmation.subtitle')}</p>
            </div>
            
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors"
              >
                <GlobeAltIcon className="h-4 w-4" />
                <span>{languages.find(lang => lang.code === currentLanguage)?.flag}</span>
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
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600 mr-4" />
            <div>
              <h2 className="text-lg font-semibold text-green-900">{t('public.confirmation.bookingConfirmed')}</h2>
              <p className="text-green-700">
                {t('public.confirmation.bookingCreatedSuccessfully')}
              </p>
            </div>
          </div>
        </div>

        {/* Business Information Card */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-6">
          <div className="bg-blue-600 px-6 py-4">
            <div className="text-white">
              <h3 className="text-xl font-bold">
                {business?.name || 'Business'}
              </h3>
              <p className="text-blue-100 text-sm">
                {t('public.confirmation.bookingAt')}
              </p>
            </div>
          </div>
          
          {/* Business Address - Always show if available */}
          {business && (business.address_line1 || business.city) && (
            <div className="p-6">
              <div className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{t('public.confirmation.location')}</p>
                  <div className="text-gray-900">
                    {business.address_line1 && <div>{business.address_line1}</div>}
                    {business.address_line2 && <div>{business.address_line2}</div>}
                    {business.city && (
                      <div>
                        {business.city}
                        {business.postal_code && `, ${business.postal_code}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {booking.service_name || 'Service'}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('public.confirmation.serviceDetails')}
                </p>
              </div>
              <div className="text-right">
                <span className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                  ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                `}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date & Time */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <CalendarDaysIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">{t('public.confirmation.dateTime')}</p>
                    <p className="font-medium text-gray-900">
                      {(() => {
                        const formattedDate = formatDate(new Date(booking.starts_at));
                        return `${formattedDate.weekday}, ${formattedDate.day} ${formattedDate.month} ${formattedDate.year}`;
                      })()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatTime(booking.starts_at)} - {formatTime(booking.ends_at)}
                    </p>
                    {business?.timezone && business?.timezone !== 'UTC' && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {business.name} {t('public.confirmation.localTime')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <UserIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">{t('public.confirmation.partySize')}</p>
                    <p className="font-medium text-gray-900">
                      {booking.party_size} {booking.party_size === 1 ? t('public.availability.person') : t('public.availability.people')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer & Contact */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <UserIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">{t('public.confirmation.customer')}</p>
                    <p className="font-medium text-gray-900">{booking.customer_name}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">{t('public.confirmation.phone')}</p>
                    <p className="font-medium text-gray-900">{booking.customer_phone}</p>
                  </div>
                </div>

                {booking.customer_email && (
                  <div className="flex items-start">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">{t('public.confirmation.email')}</p>
                      <p className="font-medium text-gray-900">{booking.customer_email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Price Section - Only show if there's a price greater than 0 */}
            {booking.service_price_minor !== undefined && booking.service_price_minor !== null && booking.service_price_minor > 0 && (
              <div className="mt-6 pt-6 border-t">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-6 w-6 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-green-800">{t('public.confirmation.price')}</p>
                        <p className="text-xs text-green-600">{t('public.confirmation.totalAmount')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-900">
                        {formatPrice(booking.service_price_minor, business?.currency)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Booking ID */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('public.confirmation.bookingId')}</p>
                  <p className="font-mono text-sm text-gray-900">{booking.id}</p>
                </div>
                <button
                  onClick={copyBookingId}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                  {copied ? t('public.confirmation.copied') : t('public.confirmation.copyId')}
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={shareBooking}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center"
              >
                <ShareIcon className="h-4 w-4 mr-2" />
                {t('public.confirmation.shareBooking')}
              </button>
              
              {canCancelBooking() && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-200 font-medium flex items-center justify-center"
                >
                  <XCircleIcon className="h-4 w-4 mr-2" />
                  {t('public.confirmation.cancelBooking')}
                </button>
              )}
            </div>

            {!canCancelBooking() && booking.status !== 'cancelled' && (
              <p className="text-xs text-gray-500 text-center mt-2">
                {t('public.confirmation.cannotCancel')}
              </p>
            )}
          </div>
        </div>



        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            to={business?.slug ? `/book/${business.slug}` : "/booking-search"}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {t('public.confirmation.backToHome')}
          </Link>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">{t('public.cancel.title')}</h3>
            </div>
            <p className="text-gray-600 mb-6">
              {t('public.cancel.message')}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors duration-200"
              >
                {t('public.cancel.keepBooking')}
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={canceling}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
              >
                {canceling ? t('public.cancel.canceling') : t('public.cancel.yesCancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicBookingConfirmation; 