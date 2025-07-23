import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { publicApi } from '../../utils/api';
import { Business, ServiceWithOpenIntervals, Table, AvailabilityMatrix, AvailabilitySlot } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { formatTimeInTimezone } from '../../utils/timezone';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  CheckCircleIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

// Helper function to format date as YYYY-MM-DD without timezone conversion
const formatLocalDateAsYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to check if two dates are the same day (ignoring time)
const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

// Helper function to parse YYYY-MM-DD string as local date (not UTC)
const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
};

const PublicServiceAvailability: React.FC = () => {
  const { slug, serviceId } = useParams<{ slug: string; serviceId: string }>();
  const navigate = useNavigate();
  const { t, currentLanguage, setLanguage, languages } = useTranslation();
  
  const [business, setBusiness] = useState<Business | null>(null);
  const [service, setService] = useState<ServiceWithOpenIntervals | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [availability, setAvailability] = useState<AvailabilityMatrix | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return formatLocalDateAsYYYYMMDD(today);
  });
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [partySize, setPartySize] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!slug || !serviceId) return;

      try {
        setLoading(true);
        const [businessData, servicesData, tablesData] = await Promise.all([
          publicApi.getBusinessDetails(slug),
          publicApi.getBusinessServices(slug),
          publicApi.getServiceTables(slug, serviceId)
        ]);
        
        setBusiness(businessData);
        setTables(tablesData);
        
        // Find the specific service
        const foundService = servicesData.find(s => s.id === serviceId);
        if (!foundService) {
          setError(t('public.error.serviceNotFound'));
          return;
        }
        setService(foundService);
      } catch (err: any) {
        setError(err.detail || t('public.error.loadingServiceFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [slug, serviceId]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!slug || !serviceId || !selectedDate) return;

      try {
        setAvailabilityLoading(true);
        const availabilityData = await publicApi.checkAvailability(
          slug, 
          selectedDate, 
          partySize, 
          serviceId
        );
        setAvailability(availabilityData);
      } catch (err: any) {
        console.error(t('public.error.loadingAvailabilityFailed'), err);
        setAvailability({ slots: [], business_timezone: 'UTC' });
      } finally {
        setAvailabilityLoading(false);
      }
    };

    fetchAvailability();
  }, [slug, serviceId, selectedDate, partySize]);

  // Clear selected slot if it's no longer available
  useEffect(() => {
    if (selectedSlot && availability) {
      const isSelectedSlotStillAvailable = availability.slots.some(
        slot => slot.starts_at === selectedSlot.starts_at
      );
      if (!isSelectedSlotStillAvailable) {
        setSelectedSlot(null);
      }
    }
  }, [selectedSlot, availability]);

  const formatPrice = (priceMinor: number, currency: string = 'ALL') => {
    const price = priceMinor / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatTime = (timeString: string) => {
    const businessTimezone = availability?.business_timezone || 'UTC';
    const locale = currentLanguage === 'sq' ? 'sq-AL' : 'en-US';
    return formatTimeInTimezone(timeString, businessTimezone, locale);
  };

  const formatDate = (date: Date) => {
    const monthKey = `public.calendar.months.${date.toLocaleDateString('en-US', { month: 'long' }).toLowerCase()}`;
    const weekdayKey = `public.calendar.weekdays.full.${date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()}`;
    
    return {
      month: t(monthKey),
      weekday: t(weekdayKey),
      day: date.getDate(),
      year: date.getFullYear()
    };
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const today = new Date();
    // Create today's date at start of day for accurate comparison
    const todayStartOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateString = formatLocalDateAsYYYYMMDD(date);
      const isPast = date < todayStartOfDay;
      const isToday = isSameDay(date, today);
      const isSelected = dateString === selectedDate;

      days.push({
        date: dateString,
        day,
        isPast,
        isToday,
        isSelected
      });
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };



  const proceedToBooking = () => {
    if (!selectedSlot || !service) return;
    
    // Debug: Log the selected slot information
    console.log('🕐 DEBUG - Selected Slot:');
    console.log('Display startTime:', formatTime(selectedSlot.starts_at));
    console.log('Display endTime:', formatTime(selectedSlot.ends_at));
    console.log('Raw starts_at:', selectedSlot.starts_at);
    console.log('Raw ends_at:', selectedSlot.ends_at);
    console.log('Selected date:', selectedDate);
    
    const bookingData = {
      serviceId: service.id,
      date: selectedDate,
      startTime: selectedSlot.starts_at,
      endTime: selectedSlot.ends_at,
      partySize
    };

    console.log('📋 DEBUG - Booking Data being passed:', bookingData);

    navigate(`/book/${slug}/service/${serviceId}/booking`, { 
      state: { bookingData, service, business } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !business || !service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('public.error.serviceNotFound')}</h2>
          <p className="text-gray-600 mb-4">{error || t('public.error.serviceNotFoundMessage')}</p>
          <Link to={`/book/${slug}`} className="text-blue-600 hover:text-blue-800">
            {t('public.error.backToServices')}
          </Link>
        </div>
      </div>
    );
  }

  const calendarDays = generateCalendarDays();
  
  // Available slots (backend now handles filtering past times)
  const availableSlots = availability?.slots || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Link 
              to={`/book/${slug}`}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{service.name}</h1>
              <p className="text-gray-600 text-sm">{business.name}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Service Info & Party Size */}
          <div className="lg:col-span-1 mb-8 lg:mb-0">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('public.availability.serviceDetails')}</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('public.availability.duration')}</span>
                  <span className="font-medium">{service.duration_min} {t('common.duration.minutes')}</span>
                </div>
                {service.price_minor > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('public.availability.price')}</span>
                    <span className="font-medium">{formatPrice(service.price_minor, business.currency)}</span>
                  </div>
                )}
              </div>

              {service.description && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">{service.description}</p>
                </div>
              )}

              {/* Party Size Selection */}
              <div className="mt-6 pt-6 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('public.availability.partySize')}
                </label>
                <div className="flex items-center space-x-2">
                  <UserGroupIcon className="h-5 w-5 text-gray-400" />
                  <select
                    value={partySize}
                    onChange={(e) => setPartySize(parseInt(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? t('public.availability.person') : t('public.availability.people')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar & Time Slots */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Calendar Header */}
              <div className="px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">{t('public.availability.selectDateTime')}</h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="p-2 text-gray-600 hover:text-gray-900"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <span className="text-sm font-medium">
                      {formatDate(currentMonth).month} {currentMonth.getFullYear()}
                    </span>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="p-2 text-gray-600 hover:text-gray-900"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-6">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 mb-3">
                  <div className="h-10 w-10 flex items-center justify-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('public.calendar.weekdays.sunday')}
                  </div>
                  <div className="h-10 w-10 flex items-center justify-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('public.calendar.weekdays.monday')}
                  </div>
                  <div className="h-10 w-10 flex items-center justify-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('public.calendar.weekdays.tuesday')}
                  </div>
                  <div className="h-10 w-10 flex items-center justify-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('public.calendar.weekdays.wednesday')}
                  </div>
                  <div className="h-10 w-10 flex items-center justify-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('public.calendar.weekdays.thursday')}
                  </div>
                  <div className="h-10 w-10 flex items-center justify-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('public.calendar.weekdays.friday')}
                  </div>
                  <div className="h-10 w-10 flex items-center justify-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('public.calendar.weekdays.saturday')}
                  </div>
                </div>
                
                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => day && !day.isPast && setSelectedDate(day.date)}
                      disabled={!day || day.isPast}
                      className={`
                        h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center
                        ${!day ? 'invisible' : ''}
                        ${day?.isPast ? 'text-gray-300 cursor-not-allowed' : ''}
                        ${day?.isSelected ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-200' : ''}
                        ${day?.isToday && !day?.isSelected ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300' : ''}
                        ${day && !day.isPast && !day.isSelected && !day.isToday ? 'text-gray-900 hover:bg-gray-100 hover:shadow-sm' : ''}
                      `}
                    >
                      {day?.day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              <div className="px-6 pb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    {t('public.availability.availableTimesFor')} {(() => {
                      const date = parseLocalDate(selectedDate);
                      const formatted = formatDate(date);
                      return `${formatted.weekday}, ${formatted.month} ${formatted.day}`;
                    })()}
                  </h3>
                  {availability?.business_timezone && (
                    <span className="text-xs text-gray-500 flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {business?.name} {t('public.availability.localTime')}
                    </span>
                  )}
                </div>

                {availabilityLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {availableSlots.map((slot: AvailabilitySlot, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSlot(slot)}
                        className={`
                          p-3 text-sm rounded border transition-colors
                          ${selectedSlot?.starts_at === slot.starts_at 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100'
                          }
                        `}
                      >
                        <div className="font-medium">{formatTime(slot.starts_at)}</div>
                        <div className="text-xs opacity-75">
                          {t('public.availability.available')}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">{t('public.availability.noAvailableTimes')}</p>
                    <p className="text-sm text-gray-500 mt-1">{t('public.availability.tryDifferentDate')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Continue Button */}
            {selectedSlot && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{t('public.availability.selectedTime')}</h3>
                    <p className="text-sm text-gray-600">
                      {(() => {
                        const date = parseLocalDate(selectedDate);
                        const formatted = formatDate(date);
                        return `${formatted.weekday}, ${formatted.month} ${formatted.day}`;
                      })()} {t('public.availability.at')} {formatTime(selectedSlot.starts_at)}
                    </p>
                    {availability?.business_timezone && business?.timezone !== 'UTC' && (
                      <p className="text-xs text-gray-500 mt-1">
                        {business?.name} {t('public.availability.localTime')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={proceedToBooking}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 font-medium flex items-center"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    {t('public.availability.continueToBooking')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicServiceAvailability; 