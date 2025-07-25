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
  CalendarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';
import { BookingWithService, BookingStatus } from '../../types';
import { formatTimeInTimezone, formatDateInTimezone } from '../../utils/timezone';

type ViewMode = 'month' | 'week' | 'day' | 'agenda';

interface BusinessBookingsCalendarProps {
  bookings: BookingWithService[];
  businessTimezone?: string;
  onBookingClick?: (booking: BookingWithService) => void;
}

const BusinessBookingsCalendar: React.FC<BusinessBookingsCalendarProps> = ({ 
  bookings,
  businessTimezone = 'UTC',
  onBookingClick 
}) => {
  const { t, currentLanguage } = useTranslation();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  // Translation helper - all keys should exist in both languages
  const safeT = (key: string, fallback: string) => {
    const translation = t(key);
    // Only use fallback if translation returns the key itself (not found)
    return translation === key ? fallback : translation;
  };

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

  const getDayName = (dayIndex: number) => {
    const dayKeys = [
      'calendar.days.sunday', 'calendar.days.monday', 'calendar.days.tuesday',
      'calendar.days.wednesday', 'calendar.days.thursday', 'calendar.days.friday', 'calendar.days.saturday'
    ];
    return t(dayKeys[dayIndex]);
  };

  const formatDate = (date: Date) => {
    // Use the app's translation system instead of browser locale
    const day = date.getDate();
    const month = getMonthName(date.getMonth());
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const formatDateWithWeekday = (date: Date) => {
    // Format date with weekday for more detailed displays
    const weekday = getDayName(date.getDay());
    const day = date.getDate();
    const month = getMonthName(date.getMonth());
    const year = date.getFullYear();
    return `${weekday} ${month} ${day}, ${year}`;
  };

  const formatTime = (dateString: string) => {
    return formatTimeInTimezone(dateString, businessTimezone, getLocale(currentLanguage), {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Booking helpers
  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.starts_at).toISOString().split('T')[0];
      return bookingDate === dateStr;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.confirmed:
        return 'bg-green-100 text-green-800 border-green-200';
      case BookingStatus.pending:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case BookingStatus.cancelled:
        return 'bg-red-100 text-red-800 border-red-200';
      case BookingStatus.completed:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case BookingStatus.no_show:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case BookingStatus.rescheduled:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calendar grid helpers
  const getCalendarDays = () => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Start from the Sunday of the week containing the first day
    const startDate = new Date(start);
    startDate.setDate(start.getDate() - start.getDay());
    
    // End on the Saturday of the week containing the last day
    const endDate = new Date(end);
    endDate.setDate(end.getDate() + (6 - end.getDay()));
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  // Calendar Views
  const MonthView = () => {
    const calendarDays = getCalendarDays();
    
    return (
      <div className="space-y-2 sm:space-y-4">
        {/* Month header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div key={day} className="p-1 sm:p-2 text-center text-xs font-medium text-gray-500 uppercase">
              <span className="hidden sm:inline">{getDayName(index).substring(0, 3)}</span>
              <span className="sm:hidden">{getDayName(index).substring(0, 1)}</span>
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {calendarDays.map((date, index) => {
            const dayBookings = getBookingsForDate(date);
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  min-h-16 sm:min-h-20 p-1 sm:p-2 border rounded-md sm:rounded-lg cursor-pointer transition-all touch-manipulation
                  ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 opacity-50'}
                  ${isToday(date) ? 'ring-2 ring-blue-500' : 'border-gray-200'}
                  ${isSelected ? 'bg-blue-50 border-blue-300' : ''}
                  hover:shadow-sm
                `}
                onClick={() => setSelectedDate(date)}
              >
                <div className={`text-xs sm:text-sm font-medium mb-1 ${isToday(date) ? 'text-blue-600' : 'text-gray-900'}`}>
                  {date.getDate()}
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  {/* Show booking indicators - dots on mobile, details on desktop */}
                  {dayBookings.slice(0, 3).map((booking) => (
                    <div
                      key={booking.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookingClick?.(booking);
                      }}
                      className={`
                        text-xs px-1 py-0.5 rounded border truncate cursor-pointer touch-manipulation
                        ${getStatusColor(booking.status)}
                      `}
                      title={`${booking.customer_name} - ${booking.service_name} - ${formatTime(booking.starts_at)}`}
                    >
                      <span className="hidden sm:inline">{formatTime(booking.starts_at)} {booking.customer_name}</span>
                      <span className="sm:hidden w-1 h-1 rounded-full bg-current inline-block"></span>
                    </div>
                  ))}
                  {dayBookings.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      <span className="hidden sm:inline">+{dayBookings.length - 3} {t('calendar.more')}</span>
                    </div>
                  )}
                  {/* Mobile: Show count if there are bookings */}
                  {dayBookings.length > 0 && (
                    <div className="sm:hidden text-xs text-gray-500 text-center font-medium">
                      {dayBookings.length}
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
    const weekDays = getWeekDays();
    
    return (
      <div className="space-y-4">
        {/* Mobile: Horizontal scroll, Desktop: Grid */}
        <div className="sm:hidden">
          <div className="flex space-x-3 overflow-x-auto pb-4">
            {weekDays.map((date, index) => {
              const dayBookings = getBookingsForDate(date).sort((a, b) => 
                new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
              );
              
              return (
                <div key={index} className="flex-shrink-0 w-64 space-y-3">
                  <div className={`text-center p-3 rounded-lg ${isToday(date) ? 'bg-blue-100 text-blue-800' : 'bg-gray-50'}`}>
                    <div className="text-sm font-medium">{getDayName(date.getDay())}</div>
                    <div className={`text-2xl font-bold ${isToday(date) ? 'text-blue-600' : 'text-gray-900'}`}>
                      {date.getDate()}
                    </div>
                    <div className="text-xs text-gray-600">{getMonthName(date.getMonth())}</div>
                  </div>
                  <div className="space-y-2 min-h-64">
                    {dayBookings.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        {t('calendar.noBookings')}
                      </div>
                    ) : (
                      dayBookings.map((booking) => (
                        <motion.div
                          key={booking.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onBookingClick?.(booking)}
                          className={`
                            p-3 rounded-lg border cursor-pointer text-sm touch-manipulation
                            ${getStatusColor(booking.status)}
                            hover:shadow-sm
                          `}
                        >
                          <div className="font-medium mb-1">{formatTime(booking.starts_at)}</div>
                          <div className="truncate font-medium">{booking.customer_name}</div>
                          <div className="truncate text-gray-600 text-xs">{booking.service_name}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {booking.party_size} {booking.party_size === 1 ? 'person' : 'people'}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop: Grid layout */}
        <div className="hidden sm:block">
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((date, index) => {
              const dayBookings = getBookingsForDate(date).sort((a, b) => 
                new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
              );
              
              return (
                <div key={index} className="space-y-2">
                  <div className={`text-center p-2 rounded-lg ${isToday(date) ? 'bg-blue-100 text-blue-800' : 'bg-gray-50'}`}>
                    <div className="text-xs font-medium">{getDayName(date.getDay()).substring(0, 3)}</div>
                    <div className={`text-lg font-bold ${isToday(date) ? 'text-blue-600' : 'text-gray-900'}`}>
                      {date.getDate()}
                    </div>
                  </div>
                  <div className="space-y-1 min-h-64">
                    {dayBookings.map((booking) => (
                      <motion.div
                        key={booking.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => onBookingClick?.(booking)}
                        className={`
                          p-2 rounded border cursor-pointer text-xs
                          ${getStatusColor(booking.status)}
                          hover:shadow-sm
                        `}
                      >
                        <div className="font-medium">{formatTime(booking.starts_at)}</div>
                        <div className="truncate">{booking.customer_name}</div>
                        <div className="truncate text-gray-600">{booking.service_name}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="text-center">
            <h2 className={`text-xl sm:text-2xl font-bold ${isToday(currentDate) ? 'text-blue-600' : 'text-gray-900'}`}>
              <span className="sm:hidden">{formatDate(currentDate)}</span>
              <span className="hidden sm:inline">{formatDateWithWeekday(currentDate)}</span>
            </h2>
            {isToday(currentDate) && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mt-2">
                {t('calendar.today')}
              </span>
            )}
            <p className="mt-2 text-gray-600">
              {dayBookings.length} {dayBookings.length === 1 ? t('calendar.booking') : t('calendar.bookings')} {t('calendar.scheduled')}
            </p>
          </div>
        </div>

        {/* Bookings timeline */}
        <div className="space-y-3">
          {dayBookings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('calendar.noBookings')}</h3>
              <p className="text-gray-500">{t('calendar.noBookingsToday')}</p>
            </div>
          ) : (
            dayBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onBookingClick?.(booking)}
                className={`
                  p-4 sm:p-6 rounded-lg border cursor-pointer transition-all touch-manipulation
                  ${getStatusColor(booking.status)}
                  hover:shadow-md
                `}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                      <ClockIcon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium text-base">
                        {formatTime(booking.starts_at)} - {formatTime(booking.ends_at)}
                      </span>
                    </div>
                    <div className="mt-3 sm:mt-2 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:space-x-6">
                      <span className="flex items-center text-sm sm:text-base">
                        <UserIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="font-medium">{booking.customer_name}</span>
                      </span>
                      <span className="flex items-center text-sm text-gray-600">
                        <BuildingStorefrontIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                        {booking.service_name}
                      </span>
                      <span className="flex items-center text-sm text-gray-600">
                        <UserGroupIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                        {booking.party_size} {booking.party_size === 1 ? 'person' : 'people'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  };

  const AgendaView = () => {
    // Get next 30 days of bookings
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const upcomingBookings = bookings
      .filter(booking => {
        const bookingDate = new Date(booking.starts_at);
        return bookingDate >= new Date() && bookingDate <= thirtyDaysFromNow;
      })
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
    
    // Group by date
    const groupedBookings = upcomingBookings.reduce((groups, booking) => {
      const date = new Date(booking.starts_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(booking);
      return groups;
    }, {} as Record<string, BookingWithService[]>);
    
    return (
      <div className="space-y-6">
        {Object.entries(groupedBookings).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('calendar.noUpcomingBookings')}</h3>
              <p className="text-gray-500">{t('calendar.noUpcomingBookingsDesc')}</p>
          </div>
        ) : (
          Object.entries(groupedBookings).map(([dateStr, dayBookings], dateIndex) => {
            const date = new Date(dateStr);
            
            return (
              <motion.div
                key={dateStr}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dateIndex * 0.1 }}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                <div className={`px-4 py-3 border-b border-gray-200 ${isToday(date) ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  <h3 className={`font-medium ${isToday(date) ? 'text-blue-900' : 'text-gray-900'}`}>
                    <span className="sm:hidden">{formatDate(date)}</span>
                    <span className="hidden sm:inline">{formatDateWithWeekday(date)}</span>
                    {isToday(date) && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {t('calendar.today')}
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {dayBookings.length} {dayBookings.length === 1 ? t('calendar.booking') : t('calendar.bookings')}
                  </p>
                </div>
                <div className="divide-y divide-gray-200">
                  {dayBookings.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      whileHover={{ backgroundColor: '#f9fafb' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onBookingClick?.(booking)}
                      className="p-4 cursor-pointer transition-colors touch-manipulation"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                            <span className="font-medium text-gray-900 text-base">{booking.customer_name}</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium self-start ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1 sm:space-y-0 sm:flex sm:items-center sm:space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <ClockIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                              {formatTime(booking.starts_at)} - {formatTime(booking.ends_at)}
                            </span>
                            <span className="flex items-center">
                              <BuildingStorefrontIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                              <span className="truncate">{booking.service_name}</span>
                            </span>
                            <span className="flex items-center">
                              <UserIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                              {booking.party_size} {booking.party_size === 1 ? 'person' : 'people'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Mobile-optimized Header */}
      <div className="space-y-4">
        {/* Title and Navigation Row */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateDate('prev')}
            className="p-3 rounded-lg border border-gray-300 hover:bg-gray-50 touch-manipulation"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          
          <div className="flex-1 text-center px-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 leading-tight">
              {viewMode === 'month' && `${getMonthName(currentDate.getMonth())} ${currentDate.getFullYear()}`}
              {viewMode === 'week' && (() => {
                const weekDays = getWeekDays();
                const startDay = weekDays[0];
                const endDay = weekDays[6];
                const startMonth = getMonthName(startDay.getMonth());
                const endMonth = getMonthName(endDay.getMonth());
                
                // If same month, show "Month DD - DD, YYYY"
                if (startDay.getMonth() === endDay.getMonth()) {
                  return `${startMonth} ${startDay.getDate()} - ${endDay.getDate()}, ${endDay.getFullYear()}`;
                }
                // If different months, show "Month DD - Month DD, YYYY"
                return `${startMonth} ${startDay.getDate()} - ${endMonth} ${endDay.getDate()}, ${endDay.getFullYear()}`;
              })()}
              {viewMode === 'day' && formatDateWithWeekday(currentDate)}
              {viewMode === 'agenda' && t('calendar.agenda')}
            </h2>
          </div>
          
          <button
            onClick={() => navigateDate('next')}
            className="p-3 rounded-lg border border-gray-300 hover:bg-gray-50 touch-manipulation"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Today Button and View Mode Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 touch-manipulation"
          >
            {t('calendar.today')}
          </button>
          
          {/* Mobile-friendly View Mode Selector */}
          <div className="flex flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-4 w-full bg-gray-100 rounded-lg p-1 gap-1">
              <button
                onClick={() => setViewMode('month')}
                className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors touch-manipulation ${
                  viewMode === 'month' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Squares2X2Icon className="w-4 h-4 mx-auto sm:mr-1 sm:inline" />
                <span className="hidden sm:inline">{t('calendar.views.month')}</span>
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors touch-manipulation ${
                  viewMode === 'agenda' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ListBulletIcon className="w-4 h-4 mx-auto sm:mr-1 sm:inline" />
                <span className="hidden sm:inline">{t('calendar.views.agenda')}</span>
              </button>
              {/* Hide week/day views on mobile, show on larger screens */}
              <button
                onClick={() => setViewMode('week')}
                className={`hidden sm:block px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors touch-manipulation ${
                  viewMode === 'week' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ViewColumnsIcon className="w-4 h-4 mx-auto sm:mr-1 sm:inline" />
                <span className="hidden sm:inline">{t('calendar.views.week')}</span>
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`hidden sm:block px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors touch-manipulation ${
                  viewMode === 'day' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <CalendarIcon className="w-4 h-4 mx-auto sm:mr-1 sm:inline" />
                <span className="hidden sm:inline">{t('calendar.views.day')}</span>
              </button>
            </div>
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

export default BusinessBookingsCalendar; 