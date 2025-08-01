import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { publicApi } from '../../utils/api';
import { Business, ServiceWithOpenIntervals, SessionWithBookings, BookingMode } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  RectangleGroupIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface BookingData {
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  partySize: number;
  sessionId?: string;
}

const PublicSessionSelection: React.FC = () => {
  const { slug, serviceId } = useParams<{ slug: string; serviceId: string }>();
  const navigate = useNavigate();
  const { t, currentLanguage, setLanguage, languages } = useTranslation();
  
  // State
  const [business, setBusiness] = useState<Business | null>(null);
  const [service, setService] = useState<ServiceWithOpenIntervals | null>(null);
  const [sessions, setSessions] = useState<SessionWithBookings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partySize, setPartySize] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSession, setSelectedSession] = useState<SessionWithBookings | null>(null);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  
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

  // Fetch business and service data
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!slug || !serviceId) return;

      try {
        setLoading(true);
        setError(null);
        
        const [businessData, servicesData] = await Promise.all([
          publicApi.getBusinessDetails(slug),
          publicApi.getBusinessServices(slug)
        ]);
        
        setBusiness(businessData);
        
        const serviceData = servicesData.find(s => s.id === serviceId);
        if (!serviceData) {
          throw new Error('Service not found');
        }
        
        if (serviceData.booking_mode !== BookingMode.session) {
          // Redirect to appointment booking for non-session services
          navigate(`/book/${slug}/service/${serviceId}`);
          return;
        }
        
        setService(serviceData);
        
      } catch (err: any) {
        setError(err.detail || t('public.error.loadingFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [slug, serviceId, navigate, t]);

  // Fetch sessions when date changes
  useEffect(() => {
    const fetchSessions = async () => {
      if (!slug || !serviceId || !service) return;

      try {
        const dateString = selectedDate.toISOString().split('T')[0];
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayString = nextDay.toISOString().split('T')[0];
        
        const sessionsData = await publicApi.getServiceSessions(
          slug,
          serviceId,
          dateString,
          nextDayString,
          'scheduled'
        );
        
        setSessions(sessionsData);
      } catch (err: any) {
        console.error('Failed to fetch sessions:', err);
        setSessions([]);
      }
    };

    fetchSessions();
  }, [slug, serviceId, service, selectedDate]);

  const formatPrice = (priceMinor: number, currency: string = 'ALL') => {
    const price = priceMinor / 100;
    const locale = currentLanguage === 'sq' ? 'sq-AL' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const locale = currentLanguage === 'sq' ? 'sq-AL' : 'en-US';
    return date.toLocaleTimeString(locale, { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    if (currentLanguage === 'sq') {
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
      return {
        month: date.toLocaleDateString('en-US', { month: 'long' }),
        weekday: date.toLocaleDateString('en-US', { weekday: 'long' }),
        day: date.getDate(),
        year: date.getFullYear()
      };
    }
  };

  const getDayIndex = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    const startOffset = currentWeekOffset * 14; // Show 2 weeks at a time
    
    for (let i = startOffset; i < startOffset + 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const canGoToPreviousWeek = () => {
    return currentWeekOffset > 0;
  };

  const canGoToNextWeek = () => {
    // Allow navigation up to 12 weeks (3 months) into the future
    return currentWeekOffset < 12;
  };

  const goToPreviousWeek = () => {
    if (canGoToPreviousWeek()) {
      setCurrentWeekOffset(prev => prev - 1);
      setSelectedSession(null);
    }
  };

  const goToNextWeek = () => {
    if (canGoToNextWeek()) {
      setCurrentWeekOffset(prev => prev + 1);
      setSelectedSession(null);
    }
  };

  // Reset selected date when week offset changes if it's no longer visible
  useEffect(() => {
    const currentDates = generateDateOptions();
    const isSelectedDateVisible = currentDates.some(date => 
      date.toDateString() === selectedDate.toDateString()
    );
    
    if (!isSelectedDateVisible && currentDates.length > 0) {
      setSelectedDate(currentDates[0]);
    }
  }, [currentWeekOffset]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSession(null);
  };

  const handleSessionSelect = (session: SessionWithBookings) => {
    if (!business || !service) return;
    
    // Since backend already filters to only show available sessions with space,
    // we can directly select the session without additional availability checks
    setSelectedSession(session);
    setError(null);
  };

  const handleProceedToBooking = () => {
    if (!selectedSession || !business || !service) return;

    const bookingData: BookingData = {
      serviceId: service.id,
      date: selectedDate.toISOString().split('T')[0],
      startTime: selectedSession.start_time,
      endTime: selectedSession.end_time,
      partySize: partySize,
      sessionId: selectedSession.id
    };

    navigate(`/book/${slug}/service/${serviceId}/form`, {
      state: { bookingData, service, business }
    });
  };

  const getSessionStatus = (session: SessionWithBookings) => {
    const now = new Date();
    const sessionStart = new Date(session.start_time);
    
    if (sessionStart < now) {
      return { label: t('public.sessions.status.past'), color: 'text-gray-500' };
    }
    
    if (session.seats_left === 0) {
      return { label: t('public.sessions.status.full'), color: 'text-red-600' };
    }
    
    if (session.seats_left <= 3) {
      return { label: t('public.sessions.status.almostFull'), color: 'text-orange-600' };
    }
    
    return { label: t('public.sessions.status.available'), color: 'text-green-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('public.error.loadingFailed')}</h2>
          <p className="text-gray-600">{error}</p>
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
            <div className="flex items-center">
              <Link 
                to={`/business/${slug}`}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{t('public.sessions.selectSession')}</h1>
                <p className="text-gray-600 text-sm">{business?.name} • {service?.name}</p>
              </div>
            </div>
            
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Session Selection */}
          <div className="lg:col-span-2 space-y-8">
            {/* Party Size Selection */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('public.sessions.partySize')}</h2>
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  {t('public.sessions.numberOfPeople')}
                </label>
                <select
                  value={partySize}
                  onChange={(e) => setPartySize(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i === 0 ? t('public.sessions.person') : t('public.sessions.people')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Selection */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{t('public.sessions.selectDate')}</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={goToPreviousWeek}
                    disabled={!canGoToPreviousWeek()}
                    className={`p-2 rounded-lg border transition-colors ${
                      canGoToPreviousWeek()
                        ? 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-600'
                        : 'border-gray-200 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={goToNextWeek}
                    disabled={!canGoToNextWeek()}
                    className={`p-2 rounded-lg border transition-colors ${
                      canGoToNextWeek()
                        ? 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-600'
                        : 'border-gray-200 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Show date range indicator */}
              {currentWeekOffset > 0 && (
                <div className="mb-4 text-center">
                  <span className="text-sm text-gray-600">
                    {(() => {
                      const firstDate = generateDateOptions()[0];
                      const lastDate = generateDateOptions()[13];
                      const firstFormatted = formatDate(firstDate);
                      const lastFormatted = formatDate(lastDate);
                      
                      if (firstDate.getMonth() === lastDate.getMonth()) {
                        return `${firstFormatted.day} - ${lastFormatted.day} ${firstFormatted.month} ${firstFormatted.year}`;
                      } else {
                        return `${firstFormatted.day} ${firstFormatted.month} - ${lastFormatted.day} ${lastFormatted.month} ${firstFormatted.year}`;
                      }
                    })()}
                  </span>
                </div>
              )}
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">
                {generateDateOptions().map((date, index) => {
                  const isSelected = selectedDate.toDateString() === date.toDateString();
                  const formattedDate = formatDate(date);
                  const dayIndex = getDayIndex(date);
                  const isToday = dayIndex === 0;
                  const isTomorrow = dayIndex === 1;
                  
                  return (
                    <button
                      key={`${currentWeekOffset}-${index}`}
                      onClick={() => handleDateSelect(date)}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-xs text-gray-500">
                        {isToday ? t('public.sessions.today') : 
                         isTomorrow ? t('public.sessions.tomorrow') : 
                         formattedDate.weekday.slice(0, 3)}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formattedDate.day} {formattedDate.month.slice(0, 3)}
                      </div>
                      {currentWeekOffset === 0 && (isToday || isTomorrow) && (
                        <div className="text-xs text-blue-600 font-medium mt-1">
                          •
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-4 text-center text-xs text-gray-500">
                {t('public.sessions.dateNavigation')}
              </div>
            </div>

            {/* Sessions List */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {t('public.sessions.availableSessions')}
                </h2>
                <div className="text-sm text-gray-500">
                  {formatDate(selectedDate).weekday}, {formatDate(selectedDate).day} {formatDate(selectedDate).month} {formatDate(selectedDate).year}
                </div>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {sessions.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t('public.sessions.noSessions')}</h3>
                  <p className="text-gray-600">{t('public.sessions.noSessionsDescription')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => {
                    const status = getSessionStatus(session);
                    const isSelected = selectedSession?.id === session.id;
                    const isPast = new Date(session.start_time) < new Date();
                    const isFull = session.seats_left === 0;
                    const canBook = !isPast && !isFull && session.is_available;
                    
                    return (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : canBook
                            ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                        }`}
                        onClick={() => canBook && handleSessionSelect(session)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <div className="flex items-center space-x-2">
                                <ClockIcon className="h-4 w-4 text-gray-400" />
                                <span className="font-medium text-gray-900">
                                  {formatTime(session.start_time)} - {formatTime(session.end_time)}
                                </span>
                              </div>
                              {session.name && (
                                <div className="text-sm text-gray-600">
                                  {session.name}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <UserGroupIcon className="h-4 w-4" />
                                <span>
                                  {session.seats_left}/{session.capacity} {t('public.sessions.available')}
                                </span>
                              </div>
                              
                              {session.table_code && (
                                <div className="flex items-center space-x-1">
                                  <RectangleGroupIcon className="h-4 w-4" />
                                  <span>{session.table_code}</span>
                                </div>
                              )}
                              
                              <div className={`font-medium ${status.color}`}>
                                {status.label}
                              </div>
                            </div>
                          </div>
                          
                          {canBook && (
                            <div className="ml-4">
                              <CheckCircleIcon 
                                className={`h-6 w-6 ${
                                  isSelected ? 'text-blue-600' : 'text-gray-300'
                                }`} 
                              />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('public.sessions.bookingSummary')}</h2>
              
              {service && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">{t('public.sessions.service')}</p>
                    <p className="font-medium text-gray-900">{service.name}</p>
                    {service.description && (
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">{t('public.sessions.date')}</p>
                    <p className="font-medium text-gray-900">
                      {(() => {
                        const formattedDate = formatDate(selectedDate);
                        return `${formattedDate.weekday}, ${formattedDate.day} ${formattedDate.month} ${formattedDate.year}`;
                      })()}
                    </p>
                  </div>

                  {selectedSession && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">{t('public.sessions.time')}</p>
                        <p className="font-medium text-gray-900">
                          {formatTime(selectedSession.start_time)} - {formatTime(selectedSession.end_time)}
                        </p>
                        {selectedSession.name && (
                          <p className="text-sm text-gray-600">{selectedSession.name}</p>
                        )}
                      </div>

                      {selectedSession.table_code && (
                        <div>
                          <p className="text-sm text-gray-500">{t('public.sessions.location')}</p>
                          <p className="font-medium text-gray-900">{selectedSession.table_code}</p>
                        </div>
                      )}
                    </>
                  )}

                  <div>
                    <p className="text-sm text-gray-500">{t('public.sessions.partySize')}</p>
                    <p className="font-medium text-gray-900">
                      {partySize} {partySize === 1 ? t('public.sessions.person') : t('public.sessions.people')}
                    </p>
                  </div>

                  {service.price_minor > 0 && (
                    <div>
                      <p className="text-sm text-gray-500">{t('public.sessions.price')}</p>
                      <p className="font-medium text-gray-900">
                        {formatPrice(service.price_minor, business?.currency)}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <button
                      onClick={handleProceedToBooking}
                      disabled={!selectedSession}
                      className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                        selectedSession
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {t('public.sessions.continueToBooking')}
                    </button>

                    {!selectedSession && (
                      <p className="text-xs text-gray-500 text-center mt-2">
                        {t('public.sessions.selectSessionFirst')}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicSessionSelection; 