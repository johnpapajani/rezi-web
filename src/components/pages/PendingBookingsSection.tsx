import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  UserIcon,
  CalendarDaysIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';
import { BookingWithService, BookingStatus } from '../../types';

interface PendingBookingsSectionProps {
  pendingBookings: BookingWithService[];
  onConfirmBooking: (bookingId: string) => Promise<void>;
  onRejectBooking: (bookingId: string) => Promise<void>;
  onConfirmAll: () => Promise<void>;
  onViewAllPending: () => void;
}

interface LoadingState {
  [key: string]: boolean;
}

const PendingBookingsSection: React.FC<PendingBookingsSectionProps> = ({
  pendingBookings,
  onConfirmBooking,
  onRejectBooking,
  onConfirmAll,
  onViewAllPending,
}) => {
  const { t } = useTranslation();
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});
  const [confirmingAll, setConfirmingAll] = useState(false);
  const [successMessages, setSuccessMessages] = useState<{ [key: string]: string }>({});

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

  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getBookingUrgency = (booking: BookingWithService) => {
    const now = new Date();
    const bookingTime = new Date(booking.starts_at);
    const hoursUntil = (bookingTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntil < 2) return 'urgent';
    if (hoursUntil < 24) return 'today';
    return 'upcoming';
  };

  const handleConfirm = async (bookingId: string) => {
    setLoadingStates(prev => ({ ...prev, [`confirm-${bookingId}`]: true }));
    try {
      await onConfirmBooking(bookingId);
      setSuccessMessages(prev => ({ ...prev, [bookingId]: t('serviceManagement.pendingBookings.confirmed') }));
      setTimeout(() => {
        setSuccessMessages(prev => {
          const newMessages = { ...prev };
          delete newMessages[bookingId];
          return newMessages;
        });
      }, 3000);
    } catch (error) {
      console.error('Failed to confirm booking:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [`confirm-${bookingId}`]: false }));
    }
  };

  const handleReject = async (bookingId: string) => {
    if (!window.confirm(t('serviceManagement.pendingBookings.rejectConfirm'))) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, [`reject-${bookingId}`]: true }));
    try {
      await onRejectBooking(bookingId);
      setSuccessMessages(prev => ({ ...prev, [bookingId]: t('serviceManagement.pendingBookings.rejected') }));
      setTimeout(() => {
        setSuccessMessages(prev => {
          const newMessages = { ...prev };
          delete newMessages[bookingId];
          return newMessages;
        });
      }, 3000);
    } catch (error) {
      console.error('Failed to reject booking:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [`reject-${bookingId}`]: false }));
    }
  };

  const handleConfirmAll = async () => {
    if (!window.confirm(t('serviceManagement.pendingBookings.confirmAllMessage'))) {
      return;
    }

    setConfirmingAll(true);
    try {
      await onConfirmAll();
    } catch (error) {
      console.error('Failed to confirm all bookings:', error);
    } finally {
      setConfirmingAll(false);
    }
  };

  // Group bookings by urgency
  const urgentBookings = pendingBookings.filter(booking => getBookingUrgency(booking) === 'urgent');
  const todayBookings = pendingBookings.filter(booking => getBookingUrgency(booking) === 'today');
  const upcomingBookings = pendingBookings.filter(booking => getBookingUrgency(booking) === 'upcoming');

  if (pendingBookings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="text-center py-8">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('serviceManagement.pendingBookings.noPending')}
          </h3>
          <p className="text-gray-500">
            {t('serviceManagement.pendingBookings.noPendingDescription')}
          </p>
        </div>
      </motion.div>
    );
  }

  const renderBookingGroup = (bookings: BookingWithService[], title: string, urgencyClass: string) => {
    if (bookings.length === 0) return null;

    return (
      <div className="mb-6">
        <h4 className={`text-sm font-semibold mb-3 ${urgencyClass}`}>
          {title} ({bookings.length})
        </h4>
        <div className="space-y-3">
          {bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 border rounded-lg transition-all duration-200 ${
                successMessages[booking.id] 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-white border-gray-200 hover:border-yellow-300 hover:bg-yellow-50'
              }`}
            >
              {successMessages[booking.id] && (
                <div className="mb-3 flex items-center text-green-800 text-sm">
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  {successMessages[booking.id]}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-yellow-600" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {booking.customer_name}
                      </p>
                      {isToday(booking.starts_at) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {t('bookings.upcoming.today')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 space-x-3">
                      <div className="flex items-center">
                        <CalendarDaysIcon className="w-4 h-4 mr-1" />
                        {formatDate(booking.starts_at)}
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {formatTime(booking.starts_at)}
                      </div>
                      <div className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-1" />
                        {booking.party_size}
                      </div>
                    </div>
                    {(booking.customer_phone || booking.customer_email) && (
                      <div className="flex items-center text-xs text-gray-500 space-x-3 mt-1">
                        {booking.customer_phone && (
                          <div className="flex items-center">
                            <PhoneIcon className="w-4 h-4 mr-1" />
                            {booking.customer_phone}
                          </div>
                        )}
                        {booking.customer_email && (
                          <div className="flex items-center">
                            <EnvelopeIcon className="w-4 h-4 mr-1" />
                            {booking.customer_email}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleConfirm(booking.id)}
                    disabled={loadingStates[`confirm-${booking.id}`] || !!successMessages[booking.id]}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingStates[`confirm-${booking.id}`] ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                        {t('serviceManagement.pendingBookings.confirming')}
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-3 h-3 mr-1" />
                        {t('serviceManagement.pendingBookings.confirm')}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleReject(booking.id)}
                    disabled={loadingStates[`reject-${booking.id}`] || !!successMessages[booking.id]}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingStates[`reject-${booking.id}`] ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-700 mr-1"></div>
                        {t('serviceManagement.pendingBookings.rejecting')}
                      </>
                    ) : (
                      <>
                        <XMarkIcon className="w-3 h-3 mr-1" />
                        {t('serviceManagement.pendingBookings.reject')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-yellow-200 p-6 mb-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t('serviceManagement.pendingBookings.title')}
            </h2>
            <p className="text-sm text-gray-600">
              {t('serviceManagement.pendingBookings.subtitle')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            {pendingBookings.length} {pendingBookings.length === 1 
              ? t('serviceManagement.pendingBookings.count') 
              : t('serviceManagement.pendingBookings.countPlural')
            }
          </span>
          {pendingBookings.length > 1 && (
            <button
              onClick={handleConfirmAll}
              disabled={confirmingAll}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {confirmingAll ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b border-white mr-2"></div>
                  {t('serviceManagement.pendingBookings.confirming')}
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4 mr-2" />
                  {t('serviceManagement.pendingBookings.confirmAll')}
                </>
              )}
            </button>
          )}
          <button
            onClick={onViewAllPending}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {t('serviceManagement.pendingBookings.viewAll')}
          </button>
        </div>
      </div>

      {/* Booking Groups */}
      <div>
        {renderBookingGroup(
          urgentBookings, 
          t('serviceManagement.pendingBookings.urgentTitle'), 
          'text-red-600'
        )}
        {renderBookingGroup(
          todayBookings, 
          t('serviceManagement.pendingBookings.todayTitle'), 
          'text-orange-600'
        )}
        {renderBookingGroup(
          upcomingBookings, 
          t('serviceManagement.pendingBookings.upcomingTitle'), 
          'text-yellow-600'
        )}
      </div>
    </motion.div>
  );
};

export default PendingBookingsSection; 