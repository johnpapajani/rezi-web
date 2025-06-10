import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useUpcomingBookings } from '../../hooks/useBookings';
import { BookingStatus } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface UpcomingBookingsProps {
  bizId: string;
}

const UpcomingBookings: React.FC<UpcomingBookingsProps> = ({ bizId }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { upcomingBookings, loading, error } = useUpcomingBookings({ bizId });

  const getStatusColor = (status: BookingStatus) => {
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return t('bookings.upcoming.today');
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return t('bookings.upcoming.tomorrow');
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">{t('bookings.upcoming.title')}</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">{t('bookings.upcoming.title')}</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">{t('bookings.upcoming.title')}</h3>
        <button
          onClick={() => navigate(`/business/${bizId}/bookings`)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
        >
          {t('bookings.upcoming.viewAll')}
          <ArrowRightIcon className="ml-1 h-4 w-4" />
        </button>
      </div>

      {upcomingBookings.length === 0 ? (
        <div className="text-center py-8">
          <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('bookings.upcoming.noBookings')}</h3>
                      <p className="mt-1 text-sm text-gray-500">
              {t('bookings.upcoming.nextBookingsHere')}
            </p>
        </div>
      ) : (
        <div className="space-y-4">
          {upcomingBookings.slice(0, 5).map((booking) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/business/${bizId}/bookings`)}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <UserIcon className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900">
                      {booking.customer_name}
                    </p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <CalendarDaysIcon className="flex-shrink-0 mr-1 h-4 w-4" />
                    {formatDate(booking.starts_at)}
                    <ClockIcon className="flex-shrink-0 ml-3 mr-1 h-4 w-4" />
                    {formatTime(booking.starts_at)}
                    <UserIcon className="flex-shrink-0 ml-3 mr-1 h-4 w-4" />
                    {booking.party_size}
                  </div>
                </div>
              </div>
              {booking.service_name && (
                <div className="text-sm text-gray-500">
                  {booking.service_name}
                </div>
              )}
            </motion.div>
          ))}
          
          {upcomingBookings.length > 5 && (
            <div className="text-center pt-2">
              <button
                onClick={() => navigate(`/business/${bizId}/bookings`)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                +{upcomingBookings.length - 5} {t('bookings.upcoming.moreBookings')}
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default UpcomingBookings; 