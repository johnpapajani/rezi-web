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
} from '@heroicons/react/24/outline';
import { useCalendarBookings } from '../../hooks/useBookings';
import { useTranslation } from '../../hooks/useTranslation';
import { BookingWithService, BookingStatus } from '../../types';

const BookingCalendar: React.FC = () => {
  const { bizId } = useParams<{ bizId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { calendarBookings, loading, error, fetchCalendarBookings } = useCalendarBookings({ bizId: bizId || '' });
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  // Generate calendar days
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

  // Load bookings for current month
  useEffect(() => {
    if (bizId) {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      fetchCalendarBookings(start.toISOString(), end.toISOString());
    }
  }, [bizId, currentDate, fetchCalendarBookings]);

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return calendarBookings.filter(booking => 
      booking.starts_at.split('T')[0] === dateStr
    );
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
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const calendarDays = generateCalendarDays();
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
          <div className="mt-4 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => navigate(`/business/${bizId}`)}
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
              >
                {t('business.dashboard.tabs.dashboard')}
              </button>
              <button
                onClick={() => navigate(`/business/${bizId}/settings`)}
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
              >
                {t('business.dashboard.tabs.settings')}
              </button>
              <button
                onClick={() => navigate(`/business/${bizId}/bookings`)}
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
              >
                {t('business.dashboard.tabs.bookings')}
              </button>
              <button
                onClick={() => navigate(`/business/${bizId}/calendar`)}
                className="border-blue-500 text-blue-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
              >
                {t('business.dashboard.tabs.calendar')}
              </button>
            </nav>
          </div>
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
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                viewMode === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                viewMode === 'day'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Day
            </button>
          </div>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Booking
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <div className="bg-white shadow rounded-lg">
            {/* Calendar Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </h2>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div className="text-sm text-gray-500">
                {calendarBookings.length} bookings this month
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
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
                            +{dayBookings.length - 3} more
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {selectedDate ? formatDate(selectedDate) : 'Select a date'}
            </h3>
            
            {selectedDate && selectedDateBookings.length > 0 && (
              <div className="space-y-4">
                <div className="text-sm text-gray-500">
                  {selectedDateBookings.length} booking{selectedDateBookings.length !== 1 ? 's' : ''}
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
                      {booking.party_size} {booking.party_size === 1 ? 'person' : 'people'}
                    </div>
                    
                    {booking.service_name && (
                      <div className="text-sm text-gray-600">
                        Service: {booking.service_name}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
            
            {selectedDate && selectedDateBookings.length === 0 && (
              <div className="text-center py-8">
                <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No bookings scheduled for this date.
                </p>
              </div>
            )}
            
            {!selectedDate && (
              <div className="text-center py-8">
                <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Select a date</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Click on a date to view bookings.
                </p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Status Legend</h4>
            <div className="space-y-2">
              {[
                { status: 'confirmed', label: 'Confirmed' },
                { status: 'pending', label: 'Pending' },
                { status: 'completed', label: 'Completed' },
                { status: 'cancelled', label: 'Cancelled' },
                { status: 'no_show', label: 'No Show' },
              ].map(({ status, label }) => (
                <div key={status} className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(status as BookingStatus)}`}></div>
                  <span className="text-sm text-gray-700">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default BookingCalendar; 