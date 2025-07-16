import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  PlusIcon,
  ArrowLeftIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';
import { useCalendarBookings } from '../../hooks/useBookings';
import { useTranslation } from '../../hooks/useTranslation';
import { BookingWithService, BookingStatus } from '../../types';
import BusinessTabNavigation from '../shared/BusinessTabNavigation';

const BookingCalendar: React.FC = () => {
  const { bizId } = useParams<{ bizId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { calendarBookings, loading, error, fetchCalendarBookings } = useCalendarBookings({ bizId: bizId || '' });
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'settings' | 'services' | 'tables' | 'bookings' | 'calendar'>('calendar');

  const handleTabChange = (tab: 'dashboard' | 'settings' | 'services' | 'tables' | 'bookings' | 'calendar') => {
    setCurrentTab(tab);
  };

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

  // Generate week days
  const generateWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  };

  // Generate hours for day/week view
  const generateHours = () => {
    const hours: string[] = [];
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0');
      hours.push(`${hour}:00`);
    }
    return hours;
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
          const weekDays = generateWeekDays();
          start = weekDays[0];
          end = weekDays[6];
          break;
        case 'day':
          start = new Date(currentDate);
          start.setHours(0, 0, 0, 0);
          end = new Date(currentDate);
          end.setHours(23, 59, 59, 999);
          break;
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

  const getBookingsForDateTime = (date: Date, hour: string) => {
    const dateStr = date.toISOString().split('T')[0];
    const hourNum = parseInt(hour.split(':')[0]);
    
    return calendarBookings.filter(booking => {
      const bookingDate = new Date(booking.starts_at);
      return booking.starts_at.split('T')[0] === dateStr && 
             bookingDate.getHours() === hourNum;
    });
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
          month: 'long', 
          year: 'numeric' 
        });
      case 'week':
        const weekDays = generateWeekDays();
        const start = weekDays[0];
        const end = weekDays[6];
        return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'day':
        return currentDate.toLocaleDateString(undefined, { 
          weekday: 'long',
          month: 'long', 
          day: 'numeric',
          year: 'numeric' 
        });
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Render Month View
  const renderMonthView = () => {
    const calendarDays = generateCalendarDays();
    
    return (
      <div className="p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {[
            t('bookings.calendar.days.sun'),
            t('bookings.calendar.days.mon'),
            t('bookings.calendar.days.tue'),
            t('bookings.calendar.days.wed'),
            t('bookings.calendar.days.thu'),
            t('bookings.calendar.days.fri'),
            t('bookings.calendar.days.sat')
          ].map(day => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-gray-700"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            const dayBookings = getBookingsForDate(date);
            const isCurrentMonthDay = isCurrentMonth(date);
            const isTodayDate = isToday(date);
            
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className={`
                  min-h-[120px] p-2 border rounded-lg cursor-pointer transition-colors
                  ${isTodayDate 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                  }
                  ${!isCurrentMonthDay ? 'opacity-30' : ''}
                  ${selectedDate?.toDateString() === date.toDateString() 
                    ? 'ring-2 ring-blue-500' 
                    : ''
                  }
                `}
                onClick={() => setSelectedDate(date)}
              >
                <div className={`
                  text-sm font-medium mb-1
                  ${isTodayDate ? 'text-blue-600' : 'text-gray-900'}
                  ${!isCurrentMonthDay ? 'text-gray-400' : ''}
                `}>
                  {date.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayBookings.slice(0, 3).map((booking, bookingIndex) => (
                    <div
                      key={booking.id}
                      className={`
                        px-2 py-1 rounded text-xs text-white font-medium truncate
                        ${getStatusColor(booking.status)}
                      `}
                      title={`${booking.customer_name} - ${formatTime(booking.starts_at)}`}
                    >
                      {formatTime(booking.starts_at)} {booking.customer_name}
                    </div>
                  ))}
                  {dayBookings.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayBookings.length - 3} {t('bookings.calendar.more')}
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

  // Render Week View
  const renderWeekView = () => {
    const weekDays = generateWeekDays();
    
    return (
      <div className="p-6">
        <div className="space-y-6">
          {weekDays.map((date, index) => {
            const dayBookings = getBookingsForDate(date);
            const isTodayDate = isToday(date);
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  bg-white border rounded-lg overflow-hidden
                  ${isTodayDate ? 'border-blue-200 shadow-md' : 'border-gray-200'}
                `}
              >
                {/* Day Header */}
                <div className={`
                  px-6 py-4 border-b
                  ${isTodayDate ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}
                `}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`
                        text-lg font-semibold
                        ${isTodayDate ? 'text-blue-900' : 'text-gray-900'}
                      `}>
                        {date.toLocaleDateString(undefined, { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h3>
                      {isTodayDate && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {t('bookings.calendar.today')}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {dayBookings.length} {dayBookings.length === 1 ? t('bookings.calendar.booking') : t('bookings.calendar.bookings')}
                    </div>
                  </div>
                </div>

                {/* Day Bookings */}
                <div className="divide-y divide-gray-200">
                  {dayBookings.length > 0 ? (
                    dayBookings
                      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
                      .map((booking, bookingIndex) => (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: bookingIndex * 0.05 }}
                          className="px-6 py-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-3 h-3 rounded-full ${getStatusColor(booking.status)}`}></div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <span className="font-medium text-gray-900">
                                    {booking.customer_name}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {booking.party_size} {booking.party_size === 1 ? t('bookings.list.person') : t('bookings.list.people')}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-4 mt-1">
                                  <div className="flex items-center text-sm text-gray-500">
                                    <ClockIcon className="h-4 w-4 mr-1" />
                                    {formatTime(booking.starts_at)} - {formatTime(booking.ends_at)}
                                  </div>
                                  {booking.service_name && (
                                    <span className="text-sm text-gray-500">
                                      {booking.service_name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`
                                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                ${booking.status === BookingStatus.confirmed ? 'bg-green-100 text-green-800' : ''}
                                ${booking.status === BookingStatus.pending ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${booking.status === BookingStatus.cancelled ? 'bg-red-100 text-red-800' : ''}
                                ${booking.status === BookingStatus.completed ? 'bg-blue-100 text-blue-800' : ''}
                                ${booking.status === BookingStatus.no_show ? 'bg-gray-100 text-gray-800' : ''}
                                ${booking.status === BookingStatus.rescheduled ? 'bg-purple-100 text-purple-800' : ''}
                              `}>
                                {t(`bookings.list.filters.${booking.status}`)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))
                  ) : (
                    <div className="px-6 py-12 text-center">
                      <CalendarDaysIcon className="mx-auto h-8 w-8 text-gray-400" />
                      <h4 className="mt-2 text-sm font-medium text-gray-900">
                        {t('bookings.calendar.noBookingsThisDay')}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        {t('bookings.calendar.noBookingsScheduledThisDay')}
                      </p>
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

  // Render Day View
  const renderDayView = () => {
    const dayBookings = getBookingsForDate(currentDate);
    const isTodayDate = isToday(currentDate);
    
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Day Header */}
          <div className={`
            bg-white border rounded-lg p-6 mb-6
            ${isTodayDate ? 'border-blue-200 shadow-md' : 'border-gray-200'}
          `}>
            <div className="text-center">
              <h2 className={`
                text-2xl font-bold
                ${isTodayDate ? 'text-blue-900' : 'text-gray-900'}
              `}>
                {currentDate.toLocaleDateString(undefined, { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric' 
                })}
              </h2>
              {isTodayDate && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mt-2">
                  {t('bookings.calendar.today')}
                </span>
              )}
              <p className="mt-2 text-gray-600">
                {dayBookings.length} {dayBookings.length === 1 ? t('bookings.calendar.booking') : t('bookings.calendar.bookings')} {t('bookings.calendar.scheduled')}
              </p>
            </div>
          </div>

          {/* Bookings List */}
          {dayBookings.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {isTodayDate 
                    ? t('bookings.calendar.todaysSchedule')
                    : `${currentDate.toLocaleDateString(undefined, { weekday: 'long' })}'s ${t('bookings.calendar.schedule')}`
                  }
                </h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {dayBookings
                  .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
                  .map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="px-6 py-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className={`w-4 h-4 rounded-full ${getStatusColor(booking.status)} mt-1`}></div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {booking.customer_name}
                              </h4>
                              <span className={`
                                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                ${booking.status === BookingStatus.confirmed ? 'bg-green-100 text-green-800' : ''}
                                ${booking.status === BookingStatus.pending ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${booking.status === BookingStatus.cancelled ? 'bg-red-100 text-red-800' : ''}
                                ${booking.status === BookingStatus.completed ? 'bg-blue-100 text-blue-800' : ''}
                                ${booking.status === BookingStatus.no_show ? 'bg-gray-100 text-gray-800' : ''}
                                ${booking.status === BookingStatus.rescheduled ? 'bg-purple-100 text-purple-800' : ''}
                              `}>
                                {t(`bookings.list.filters.${booking.status}`)}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                                <span className="font-medium">{formatTime(booking.starts_at)}</span>
                                <span className="mx-1">-</span>
                                <span className="font-medium">{formatTime(booking.ends_at)}</span>
                              </div>
                              
                              <div className="flex items-center">
                                <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                                <span>
                                  {booking.party_size} {booking.party_size === 1 ? t('bookings.list.person') : t('bookings.list.people')}
                                </span>
                              </div>
                              
                              {booking.service_name && (
                                <div className="flex items-center">
                                  <BuildingStorefrontIcon className="h-4 w-4 mr-2 text-gray-400" />
                                  <span>{booking.service_name}</span>
                                </div>
                              )}
                            </div>

                            {booking.customer_email && (
                              <div className="mt-2 flex items-center text-sm text-gray-500">
                                <span className="font-medium">{t('bookings.calendar.contact')}:</span>
                                <span className="ml-2">{booking.customer_email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0 ml-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              {formatTime(booking.starts_at).split(' ')[0]}
                            </div>
                            <div className="text-xs text-gray-500 uppercase">
                              {formatTime(booking.starts_at).split(' ')[1]}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                }
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <CalendarDaysIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {t('bookings.calendar.noBookingsToday')}
              </h3>
              <p className="text-gray-500 mb-6">
                {isTodayDate 
                  ? t('bookings.calendar.noBookingsScheduledToday')
                  : t('bookings.calendar.noBookingsScheduledThisDay')
                }
              </p>
              <button
                onClick={() => setViewMode('month')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t('bookings.calendar.viewMonth')}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const selectedDateBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

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
                <h1 className="text-2xl font-bold text-gray-900">{t('bookings.calendar.title')}</h1>
                <p className="text-sm text-gray-600">{t('bookings.calendar.subtitle')}</p>
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
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                viewMode === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {t('bookings.calendar.viewModes.month')}
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                viewMode === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {t('bookings.calendar.viewModes.week')}
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                viewMode === 'day'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {t('bookings.calendar.viewModes.day')}
            </button>
          </div>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            {t('bookings.calendar.newBooking')}
          </button>
        </div>
      </div>

      <div className={`grid ${viewMode === 'month' ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1'} gap-8`}>
        {/* Calendar */}
        <div className={viewMode === 'month' ? 'lg:col-span-3' : ''}>
          <div className="bg-white shadow rounded-lg">
            {/* Calendar Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate_('prev')}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900">
                  {getViewTitle()}
                </h2>
                <button
                  onClick={() => navigate_('next')}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div className="text-sm text-gray-500">
                {calendarBookings.length} {viewMode === 'month' ? t('bookings.calendar.bookingsThisMonth') : t('bookings.calendar.bookings')}
              </div>
            </div>

            {/* Calendar Content */}
            {viewMode === 'month' && renderMonthView()}
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'day' && renderDayView()}
          </div>
        </div>

        {/* Selected Date Details - Only show in month view */}
        {viewMode === 'month' && (
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedDate ? formatDate(selectedDate) : t('bookings.calendar.selectedDate')}
              </h3>
              
              {selectedDate && selectedDateBookings.length > 0 && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-500">
                    {selectedDateBookings.length} {selectedDateBookings.length === 1 ? t('bookings.calendar.booking') : t('bookings.calendar.bookings')}
                  </div>
                  
                  {selectedDateBookings.map((booking) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(booking.status)}`}></div>
                          <span className="text-sm font-medium text-gray-900">
                            {booking.customer_name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 capitalize">
                          {booking.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {formatTime(booking.starts_at)} - {formatTime(booking.ends_at)}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <UserIcon className="h-4 w-4 mr-1" />
                        {booking.party_size} {booking.party_size === 1 ? t('bookings.list.person') : t('bookings.list.people')}
                      </div>
                      
                      {booking.service_name && (
                        <div className="text-sm text-gray-600">
                          {t('bookings.calendar.service')}: {booking.service_name}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
              
              {selectedDate && selectedDateBookings.length === 0 && (
                <div className="text-center py-8">
                  <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">{t('bookings.calendar.noBookings')}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {t('bookings.calendar.noBookingsScheduled')}
                  </p>
                </div>
              )}
              
              {!selectedDate && (
                <div className="text-center py-8">
                  <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">{t('bookings.calendar.selectDate')}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {t('bookings.calendar.clickToView')}
                  </p>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="bg-white shadow rounded-lg p-6 mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">{t('bookings.calendar.statusLegend')}</h4>
              <div className="space-y-2">
                {[
                  { status: 'confirmed', label: t('bookings.list.filters.confirmed') },
                  { status: 'pending', label: t('bookings.list.filters.pending') },
                  { status: 'completed', label: t('bookings.list.filters.completed') },
                  { status: 'cancelled', label: t('bookings.list.filters.cancelled') },
                  { status: 'no_show', label: t('bookings.list.filters.noShow') },
                ].map(({ status, label }) => (
                  <div key={status} className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(status as BookingStatus)}`}></div>
                    <span className="text-sm text-gray-700">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default BookingCalendar; 