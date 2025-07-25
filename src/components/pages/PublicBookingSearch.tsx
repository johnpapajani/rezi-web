import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../../utils/api';
import { BookingWithService } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  MagnifyingGlassIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  GlobeAltIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const PublicBookingSearch: React.FC = () => {
  const { t, currentLanguage, setLanguage, languages } = useTranslation();
  const [bookingId, setBookingId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [booking, setBooking] = useState<BookingWithService | null>(null);
  const [loading, setLoading] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  // Close language dropdown when clicking outside
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingId.trim() || !phoneNumber.trim()) {
      setError(t('public.search.bothFieldsRequired'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      
      const bookingData = await publicApi.getBookingDetails(bookingId.trim(), phoneNumber.trim());
      setBooking(bookingData);
    } catch (err: any) {
      setError(err.detail || t('public.search.notFoundMessage'));
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking || !phoneNumber) return;
    
    try {
      setCanceling(true);
      const cancelledBooking = await publicApi.cancelBooking(booking.id, phoneNumber);
      setBooking(cancelledBooking);
      setShowCancelConfirm(false);
    } catch (err: any) {
      setError(err.detail || 'Failed to cancel booking');
    } finally {
      setCanceling(false);
    }
  };

  const formatPrice = (priceMinor: number | undefined, currency: string = 'ALL') => {
    if (priceMinor === undefined) return 'N/A';
    const price = priceMinor / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDateTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-800 bg-green-100';
      case 'pending': return 'text-yellow-800 bg-yellow-100';
      case 'cancelled': return 'text-red-800 bg-red-100';
      case 'completed': return 'text-blue-800 bg-blue-100';
      case 'no_show': return 'text-gray-800 bg-gray-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'cancelled': return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default: return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return t('public.search.status.confirmed');
      case 'pending': return t('public.search.status.pending');
      case 'cancelled': return t('public.search.status.cancelled');
      case 'completed': return t('public.search.status.completed');
      case 'no_show': return t('public.search.status.noShow');
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const canCancelBooking = (booking: BookingWithService) => {
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return false;
    }
    
    // Check if booking is more than 1 hour away
    const now = new Date();
    const bookingTime = new Date(booking.starts_at);
    const timeDiff = bookingTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    
    return hoursDiff > 1;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">{t('public.search.title')}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {t('public.search.backToHome')}
              </Link>
              
              {/* Language Switcher */}
              <div className="relative" ref={languageDropdownRef}>
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors"
                >
                  <GlobeAltIcon className="h-4 w-4" />
                  <span>{languages.find(lang => lang.code === currentLanguage)?.flag}</span>
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
                
                {isLanguageOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
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
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('public.search.searchForBooking')}</h2>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="bookingId" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('public.search.bookingId')}
                </label>
                <input
                  type="text"
                  id="bookingId"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder={t('public.search.bookingIdPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('public.search.phoneNumber')}
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={t('public.search.phoneNumberPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t('public.search.searching')}</span>
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="h-4 w-4" />
                  <span>{t('public.search.searchButton')}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{t('public.search.notFound')}</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* No Results Message */}
        {hasSearched && !booking && !error && !loading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">{t('public.search.noBookingFound')}</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  {t('public.search.noBookingFoundMessage')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking Details */}
        {booking && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Status Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(booking.status)}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {getStatusText(booking.status)}
                  </span>
                </div>
                
                {canCancelBooking(booking) && (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    {t('public.search.cancelBooking')}
                  </button>
                )}
              </div>
            </div>

            {/* Booking Details */}
            <div className="px-6 py-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column - Booking Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('public.search.bookingInformation')}</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">{t('public.search.dateTime')}</p>
                          <p className="font-medium text-gray-900">{formatDateTime(booking.starts_at)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <ClockIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">{t('public.search.duration')}</p>
                          <p className="font-medium text-gray-900">{booking.service_duration_min} {t('public.search.minutes')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">{t('public.search.partySize')}</p>
                          <p className="font-medium text-gray-900">{booking.party_size} {booking.party_size === 1 ? t('public.search.person') : t('public.search.people')}</p>
                        </div>
                      </div>

                      {booking.service_price_minor && booking.service_price_minor > 0 && (
                        <div className="flex items-center space-x-3">
                          <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">{t('public.search.price')}</p>
                            <p className="font-medium text-gray-900">{formatPrice(booking.service_price_minor)}</p>
                          </div>
                        </div>
                      )}

                      {booking.table_code && (
                        <div className="flex items-center space-x-3">
                          <MapPinIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">{t('public.search.table')}</p>
                            <p className="font-medium text-gray-900">{booking.table_code} ({booking.table_seats} {t('public.search.seats')})</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Service & Customer Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('public.search.serviceDetails')}</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">{t('public.search.service')}</p>
                        <p className="font-medium text-gray-900">{booking.service_name || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">{t('public.search.bookingIdLabel')}</p>
                        <p className="font-mono text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">{booking.id}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('public.search.customerInformation')}</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">{t('public.search.customerName')}</p>
                          <p className="font-medium text-gray-900">{booking.customer_name}</p>
                        </div>
                      </div>
                      
                      {booking.customer_phone && (
                        <div className="flex items-center space-x-3">
                          <PhoneIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">{t('public.search.phone')}</p>
                            <p className="font-medium text-gray-900">{booking.customer_phone}</p>
                          </div>
                        </div>
                      )}
                      
                      {booking.customer_email && (
                        <div className="flex items-center space-x-3">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">{t('public.search.email')}</p>
                            <p className="font-medium text-gray-900">{booking.customer_email}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cancellation Notice */}
              {booking.status === 'cancelled' && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex">
                    <XCircleIcon className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{t('public.search.bookingCancelled')}</h3>
                      <div className="mt-2 text-sm text-red-700">
                        {t('public.search.bookingCancelledMessage')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cancellation Window Notice */}
              {booking.status !== 'cancelled' && !canCancelBooking(booking) && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">{t('public.search.cannotCancel')}</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        {t('public.search.cannotCancelMessage')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-2">{t('public.search.cancelConfirm.title')}</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    {t('public.search.cancelConfirm.message')}
                  </p>
                </div>
                <div className="items-center px-4 py-3">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                      {t('public.search.cancelConfirm.keep')}
                    </button>
                    <button
                      onClick={handleCancelBooking}
                      disabled={canceling}
                      className="flex-1 px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      {canceling ? t('public.search.cancelConfirm.cancelling') : t('public.search.cancelConfirm.cancel')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicBookingSearch; 