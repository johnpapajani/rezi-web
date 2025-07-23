import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { publicApi } from '../../utils/api';
import { Business, ServiceWithOpenIntervals, Table, BookingCreate } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { formatTimeInTimezone } from '../../utils/timezone';
import { 
  ArrowLeftIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface BookingData {
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  partySize: number;
}

const PublicBookingForm: React.FC = () => {
  const { slug, serviceId } = useParams<{ slug: string; serviceId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, currentLanguage, setLanguage, languages } = useTranslation();
  
  // Get data passed from the previous page
  const { bookingData, service, business } = location.state as {
    bookingData: BookingData;
    service: ServiceWithOpenIntervals;
    business: Business;
  } || {};

  const [availableTable, setAvailableTable] = useState<Table | null>(null);
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  useEffect(() => {
    // Redirect if no booking data
    if (!bookingData || !service || !business) {
      navigate(`/book/${slug}/service/${serviceId}`);
      return;
    }

    const fetchTables = async () => {
      try {
        setTablesLoading(true);
        const tablesData = await publicApi.getServiceTables(slug!, serviceId!);
        // Filter tables that can accommodate the party size
        const suitableTables = tablesData.filter(table => table.seats >= bookingData.partySize);
        
        // Auto-select the first suitable table
        if (suitableTables.length > 0) {
          setAvailableTable(suitableTables[0]);
        } else {
          setAvailableTable(null);
        }
      } catch (err: any) {
        setError(err.detail || t('public.error.loadingAvailabilityFailed'));
      } finally {
        setTablesLoading(false);
      }
    };

    fetchTables();
  }, [slug, serviceId, bookingData, service, business, navigate]);

  const formatPrice = (priceMinor: number, currency: string = 'ALL') => {
    const price = priceMinor / 100;
    const locale = currentLanguage === 'sq' ? 'sq-AL' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Helper function to parse YYYY-MM-DD string as local date (not UTC)
  const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  };

  const formatTime = (timeString: string) => {
    const businessTimezone = business?.timezone || 'UTC';
    const locale = currentLanguage === 'sq' ? 'sq-AL' : 'en-US';
    return formatTimeInTimezone(timeString, businessTimezone, locale);
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

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!customerData.name.trim()) {
      errors.name = t('public.booking.validation.nameRequired');
    }

    if (!customerData.phone.trim()) {
      errors.phone = t('public.booking.validation.phoneRequired');
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(customerData.phone.trim())) {
      errors.phone = t('public.booking.validation.phoneInvalid');
    }

    if (customerData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email.trim())) {
      errors.email = t('public.booking.validation.emailInvalid');
    }

    if (!availableTable) {
      errors.table = t('public.booking.validation.noTableAvailable');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!availableTable || !bookingData) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Debug: Log the booking data to see what's actually being sent
      console.log('🔍 DEBUG - Booking Data:');
      console.log('Display startTime:', formatTime(bookingData.startTime));
      console.log('Display endTime:', formatTime(bookingData.endTime));
      console.log('Raw startTime:', bookingData.startTime);
      console.log('Raw endTime:', bookingData.endTime);
      console.log('Selected date:', bookingData.date);

      const bookingRequest: BookingCreate = {
        service_id: bookingData.serviceId,
        table_id: availableTable.id,
        starts_at: bookingData.startTime,
        ends_at: bookingData.endTime,
        party_size: bookingData.partySize,
        customer: {
          name: customerData.name.trim(),
          phone: customerData.phone.trim(),
          email: customerData.email.trim() || undefined
        }
      };

      console.log('🚀 DEBUG - Booking Request:', bookingRequest);

      const booking = await publicApi.createBooking(slug!, bookingRequest);
      
      // Navigate to confirmation page
      navigate(`/book/confirmation/${booking.id}`, {
        state: { booking, service, business }
      });
    } catch (err: any) {
      setError(err.detail || t('public.error.createBookingFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!bookingData || !service || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Link 
              to={`/book/${slug}/service/${serviceId}`}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t('public.booking.completeBooking')}</h1>
              <p className="text-gray-600 text-sm">{business.name} • {service.name}</p>
            </div>
            
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors"
              >
                <GlobeAltIcon className="h-4 w-4" />
                <span>{languages.find(lang => lang.code === currentLanguage)?.flag}</span>
              </button>
              
              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLanguageOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 ${
                        currentLanguage === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* {t('public.booking.bookingSummary')} */}
          <div className="lg:col-span-1 mb-8 lg:mb-0">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('public.booking.bookingSummary')}</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <CalendarDaysIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {(() => {
                        const formattedDate = formatDate(parseLocalDate(bookingData.date));
                        return `${formattedDate.weekday}, ${formattedDate.day} ${formattedDate.month} ${formattedDate.year}`;
                      })()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatTime(bookingData.startTime)} - {formatTime(bookingData.endTime)}
                    </p>
                    <p className="text-sm text-gray-600">{service.duration_min} {t('public.booking.minutes')}</p>
                    {business?.timezone && business?.timezone !== 'UTC' && (
                      <p className="text-xs text-gray-500 mt-1">
                        {business.name} {t('public.booking.localTime')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <UserIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {bookingData.partySize} {bookingData.partySize === 1 ? t('public.availability.person') : t('public.availability.people')}
                    </p>
                  </div>
                </div>

                {service.price_minor > 0 && (
                  <div className="flex items-start">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatPrice(service.price_minor, business.currency)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {service.description && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">{t('public.booking.serviceDetails')}</h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('public.booking.yourInformation')}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('public.booking.fullName')} *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="name"
                          value={customerData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={`
                            w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500
                            ${validationErrors.name ? 'border-red-300' : 'border-gray-300'}
                          `}
                          placeholder={t('public.booking.fullNamePlaceholder')}
                        />
                      </div>
                      {validationErrors.name && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                      )}
                    </div>

                                      <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('public.booking.phoneNumber')} *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <PhoneIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          id="phone"
                          value={customerData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className={`
                            w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500
                            ${validationErrors.phone ? 'border-red-300' : 'border-gray-300'}
                          `}
                          placeholder={t('public.booking.phoneNumberPlaceholder')}
                        />
                      </div>
                      {validationErrors.phone && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                      )}
                    </div>

                                      <div className="md:col-span-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('public.booking.emailAddress')}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          value={customerData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`
                            w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500
                            ${validationErrors.email ? 'border-red-300' : 'border-gray-300'}
                          `}
                          placeholder={t('public.booking.emailPlaceholder')}
                        />
                      </div>
                      {validationErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                      )}
                    </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <button
                  type="submit"
                  disabled={loading || !availableTable}
                  className={`
                    w-full py-3 px-4 rounded-md font-medium transition-colors duration-200
                    ${loading || !availableTable
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                    }
                  `}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('public.booking.creatingBooking')}
                    </div>
                  ) : (
                    t('public.booking.confirmBooking')
                  )}
                </button>
                
                <p className="text-xs text-gray-500 text-center mt-2">
                  {t('public.booking.termsConditions')}
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicBookingForm; 