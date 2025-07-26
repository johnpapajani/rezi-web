import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  BuildingStorefrontIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  ListBulletIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';
import { BookingWithService, BookingStatus } from '../../types';
import { formatTimeInTimezone } from '../../utils/timezone';

type ViewMode = 'month' | 'week' | 'day' | 'agenda';

interface ServiceBookingsCalendarProps {
  serviceId: string;
  serviceName: string;
  bookings: BookingWithService[];
  businessTimezone?: string;
  onBookingClick?: (booking: BookingWithService) => void;
}

const ServiceBookingsCalendar: React.FC<ServiceBookingsCalendarProps> = ({ 
  serviceId, 
  serviceName, 
  bookings,
  businessTimezone = 'UTC',
  onBookingClick 
}) => {
  const { t, currentLanguage } = useTranslation();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  // Locale mapping helper
  const getLocale = (langCode: string) => {
    switch (langCode) {
      case 'sq': return 'sq-AL'; // Albanian (Albania)
      case 'en': return 'en-US'; // English (US)
      default: return 'en-US';
    }
  };

  // Navigation helpers
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'day':
      case 'agenda':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Date formatting helpers
  const getMonthName = (monthIndex: number) => {
    const monthKeys = [
      'calendar.months.january', 'calendar.months.february', 'calendar.months.march',
      'calendar.months.april', 'calendar.months.may', 'calendar.months.june',
      'calendar.months.july', 'calendar.months.august', 'calendar.months.september',
      'calendar.months.october', 'calendar.months.november', 'calendar.months.december'
    ];
    return t(monthKeys[monthIndex]);
  };

  const getDayName = (dayIndex: number, short: boolean = false) => {
    const longDayKeys = [
      'calendar.days.sunday', 'calendar.days.monday', 'calendar.days.tuesday',
      'calendar.days.wednesday', 'calendar.days.thursday', 'calendar.days.friday', 'calendar.days.saturday'
    ];
    const shortDayKeys = [
      'calendar.days.sun', 'calendar.days.mon', 'calendar.days.tue',
      'calendar.days.wed', 'calendar.days.thu', 'calendar.days.fri', 'calendar.days.sat'
    ];
    const keys = short ? shortDayKeys : longDayKeys;
    return t(keys[dayIndex]);
  };

  const formatDate = (date: Date) => {
    const dayName = getDayName(date.getDay());
    const monthName = getMonthName(date.getMonth());
    const day = date.getDate();
    const year = date.getFullYear();
    return `${dayName}, ${monthName} ${day}, ${year}`;
  };

  const formatDateShort = (date: Date) => {
    const monthName = getMonthName(date.getMonth());
    const year = date.getFullYear();
    return `${monthName} ${year}`;
  };

  const formatDateMedium = (date: Date) => {
    const monthName = getMonthName(date.getMonth());
    const day = date.getDate();
    const year = date.getFullYear();
    return `${monthName} ${day}, ${year}`;
  };

  const formatTime = (dateString: string) => {
    return formatTimeInTimezone(dateString, businessTimezone, getLocale(currentLanguage));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth() && 
           date.getFullYear() === currentDate.getFullYear();
  };

  // Translation helper - all keys should exist in both languages
  const safeT = (key: string, fallback?: string) => {
    const translation = t(key);
    // Only use fallback if translation returns the key itself (not found)
    return translation === key ? (fallback || key) : translation;
  };

  // Filter bookings for the current view period
  const getFilteredBookings = () => {
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
      case 'agenda':
        start = new Date(currentDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(currentDate);
        end.setHours(23, 59, 59, 999);
        break;
    }
    
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.starts_at);
      return bookingDate >= start && bookingDate <= end;
    });
  };

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(booking => 
      booking.starts_at.split('T')[0] === dateStr
    );
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.confirmed:
        return 'bg-green-500 text-white';
      case BookingStatus.pending:
        return 'bg-yellow-500 text-white';
      case BookingStatus.cancelled:
        return 'bg-red-500 text-white';
      case BookingStatus.completed:
        return 'bg-blue-500 text-white';
      case BookingStatus.no_show:
        return 'bg-gray-500 text-white';
      case BookingStatus.rescheduled:
        return 'bg-purple-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusBadgeColor = (status: BookingStatus) => {
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

  // Calendar grid generation
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

  const generateWeekDays = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const handleBookingClick = (booking: BookingWithService) => {
    if (onBookingClick) {
      onBookingClick(booking);
    }
  };

  // View Components
  const MonthView = () => {
    const calendarDays = generateCalendarDays();
    const dayNames = [
      safeT('calendar.days.sun', 'Sun'),
      safeT('calendar.days.mon', 'Mon'), 
      safeT('calendar.days.tue', 'Tue'),
      safeT('calendar.days.wed', 'Wed'),
      safeT('calendar.days.thu', 'Thu'),
      safeT('calendar.days.fri', 'Fri'),
      safeT('calendar.days.sat', 'Sat')
    ];
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {dayNames.map((day, index) => (
            <div key={index} className="p-3 text-center">
              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                {day}
              </span>
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((date, index) => {
            const dayBookings = getBookingsForDate(date);
            const isTodayDate = isToday(date);
            const isCurrentMonthDate = isCurrentMonth(date);
            const isSelectedDate = selectedDate && date.toDateString() === selectedDate.toDateString();
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.01 }}
                className={`min-h-[100px] p-2 border-r border-b border-gray-100 cursor-pointer transition-all duration-200 ${
                  isCurrentMonthDate ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'
                } ${isTodayDate ? 'ring-2 ring-blue-500 ring-inset' : ''} ${
                  isSelectedDate ? 'bg-blue-50 ring-2 ring-blue-300 ring-inset' : ''
                }`}
                onClick={() => setSelectedDate(date)}
              >
                <div className={`text-sm font-semibold mb-1 ${
                  isCurrentMonthDate ? 'text-gray-900' : 'text-gray-400'
                } ${isTodayDate ? 'text-blue-600' : ''}`}>
                  {date.getDate()}
                  {isTodayDate && (
                    <span className="ml-1 inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {safeT('calendar.today', 'Today')}
                    </span>
                  )}
                </div>
                
                <div className="space-y-1 max-h-16 overflow-hidden">
                  {dayBookings.slice(0, 2).map((booking) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer transition-transform hover:scale-105 ${getStatusColor(booking.status)}`}
                      title={`${booking.customer_name} - ${formatTime(booking.starts_at)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookingClick(booking);
                      }}
                    >
                      <div className="font-medium">{formatTime(booking.starts_at)}</div>
                      <div className="truncate">{booking.customer_name}</div>
                    </motion.div>
                  ))}
                  {dayBookings.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayBookings.length - 2} {safeT('calendar.more', 'more')}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const WeekView = () => {
    const weekDays = generateWeekDays();
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200">
          <div className="p-3"></div>
          {weekDays.map((date, index) => (
            <div key={index} className="p-3 text-center border-l border-gray-200">
              <div className="text-sm font-semibold text-gray-700">
                {getDayName(date.getDay(), true)}
              </div>
              <div className={`text-lg font-bold ${isToday(date) ? 'text-blue-600' : 'text-gray-900'}`}>
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>
        
        {/* Time grid */}
        <div className="max-h-96 overflow-y-auto">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-100">
              <div className="p-2 text-xs text-gray-500 text-right border-r border-gray-200">
                {hour.toString().padStart(2, '0')}:00
              </div>
              {weekDays.map((date, dayIndex) => {
                const hourBookings = bookings.filter(booking => {
                  const bookingDate = new Date(booking.starts_at);
                  return booking.starts_at.split('T')[0] === date.toISOString().split('T')[0] && 
                         bookingDate.getHours() === hour;
                });
                
                return (
                  <div key={dayIndex} className="min-h-[40px] p-1 border-l border-gray-100 relative">
                    {hourBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className={`text-xs p-1 rounded mb-1 cursor-pointer ${getStatusColor(booking.status)}`}
                        onClick={() => handleBookingClick(booking)}
                      >
                        <div className="font-medium">{booking.customer_name}</div>
                        <div>{formatTime(booking.starts_at)}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const DayView = () => {
    const dayBookings = getBookingsForDate(currentDate).sort((a, b) => 
      new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
    );
    
    return (
      <div className="space-y-4">
        {/* Day header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <h2 className={`text-2xl font-bold ${isToday(currentDate) ? 'text-blue-600' : 'text-gray-900'}`}>
              {formatDate(currentDate)}
            </h2>
            {isToday(currentDate) && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mt-2">
                {safeT('calendar.today', 'Today')}
              </span>
            )}
            <p className="mt-2 text-gray-600">
              {dayBookings.length} {dayBookings.length === 1 ? safeT('calendar.booking', 'booking') : safeT('calendar.bookings', 'bookings')} {safeT('calendar.scheduled', 'scheduled')}
            </p>
          </div>
        </div>

        {/* Bookings timeline */}
        {dayBookings.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {safeT('calendar.schedule', 'Schedule')}
              </h3>
            </div>
            
            <div className="divide-y divide-gray-100">
              {dayBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleBookingClick(booking)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(booking.status).replace('text-white', '')}`}></div>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{booking.customer_name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {formatTime(booking.starts_at)} - {formatTime(booking.ends_at)}
                          </div>
                          <div className="flex items-center">
                            <UserIcon className="h-4 w-4 mr-1" />
                            {booking.party_size} {booking.party_size === 1 ? safeT('calendar.person', 'person') : safeT('calendar.people', 'people')}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(booking.status)}`}>
                        {safeT(`calendar.status.${booking.status}`, booking.status)}
                      </span>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          {formatTime(booking.starts_at).split(' ')[0]}
                        </div>
                        <div className="text-xs text-gray-500 uppercase">
                          {formatTime(booking.starts_at).split(' ')[1]}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {safeT('calendar.noBookings', 'No bookings')}
            </h3>
            <p className="text-gray-500">
              {isToday(currentDate) 
                ? safeT('calendar.noBookingsToday', 'No bookings today')
                : safeT('calendar.noBookingsThisDay', 'No bookings for this day')
              }
            </p>
          </div>
        )}
      </div>
    );
  };

  const AgendaView = () => {
    const upcomingBookings = bookings
      .filter(booking => new Date(booking.starts_at) >= new Date())
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
      .slice(0, 20);
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {safeT('calendar.upcomingBookings', 'Upcoming Bookings')}
          </h3>
        </div>
        
        {upcomingBookings.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {upcomingBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleBookingClick(booking)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(booking.status).replace('text-white', '')}`}></div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{booking.customer_name}</h4>
                                              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <div>{formatDateMedium(new Date(booking.starts_at))}</div>
                        <div>{formatTime(booking.starts_at)} - {formatTime(booking.ends_at)}</div>
                        <div>{booking.party_size} {booking.party_size === 1 ? safeT('calendar.person', 'person') : safeT('calendar.people', 'people')}</div>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(booking.status)}`}>
                    {safeT(`calendar.status.${booking.status}`, booking.status)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {safeT('calendar.noUpcomingBookings', 'No upcoming bookings')}
            </h3>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Calendar Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Date Navigation */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {viewMode === 'month' && formatDateShort(currentDate)}
              {viewMode === 'week' && `${safeT('calendar.week', 'Week of')} ${formatDate(currentDate)}`}
              {(viewMode === 'day' || viewMode === 'agenda') && formatDate(currentDate)}
            </h3>
          </div>
          
          <button
            onClick={() => navigateDate('next')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
          
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
          >
            {safeT('calendar.today', 'Today')}
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'month' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Squares2X2Icon className="w-4 h-4 mr-1 inline" />
              {t('calendar.views.month')}
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'week' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ViewColumnsIcon className="w-4 h-4 mr-1 inline" />
              {t('calendar.views.week')}
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'day' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CalendarIcon className="w-4 h-4 mr-1 inline" />
              {t('calendar.views.day')}
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'agenda' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ListBulletIcon className="w-4 h-4 mr-1 inline" />
              {t('calendar.views.agenda')}
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Views */}
      <motion.div
        key={viewMode}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {viewMode === 'month' && <MonthView />}
        {viewMode === 'week' && <WeekView />}
        {viewMode === 'day' && <DayView />}
        {viewMode === 'agenda' && <AgendaView />}
      </motion.div>
    </div>
  );
};

export default ServiceBookingsCalendar; 