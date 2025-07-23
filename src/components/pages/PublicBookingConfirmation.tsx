import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { publicApi } from '../../utils/api';
import { Business, ServiceWithOpenIntervals, BookingWithService } from '../../types';
import { formatTimeInTimezone, formatDateTimeInTimezone } from '../../utils/timezone';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  CheckCircleIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const PublicBookingConfirmation: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Get data passed from the previous page if available
  const stateData = location.state as {
    booking: BookingWithService;
    service: ServiceWithOpenIntervals;
    business: Business;
  } || null;

  const [booking, setBooking] = useState<BookingWithService | null>(stateData?.booking || null);
  const [loading, setLoading] = useState(!stateData);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    // If we don't have data from state and it's needed, show error
    // The confirmation page should only be reached with booking data from the previous page
    if (!stateData && bookingId) {
      setError('Booking details are not available. Please use the booking search page to find your booking.');
      setLoading(false);
    }
  }, [bookingId, stateData]);

  const formatPrice = (priceMinor: number | undefined, currency: string = 'ALL') => {
    if (priceMinor === undefined) return 'N/A';
    const price = priceMinor / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatTime = (timeString: string) => {
    const businessTimezone = business?.timezone || 'UTC';
    return formatTimeInTimezone(timeString, businessTimezone, 'en-US');
  };

  const formatDateTime = (timeString: string) => {
    const businessTimezone = business?.timezone || 'UTC';
    return formatDateTimeInTimezone(timeString, businessTimezone, 'en-US');
  };

  const copyBookingId = () => {
    if (booking?.id) {
      navigator.clipboard.writeText(booking.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareBooking = () => {
    if (navigator.share && booking) {
      navigator.share({
        title: 'Booking Confirmation',
        text: `Booking confirmed for ${booking.service_name} on ${formatDateTime(booking.starts_at)}`,
        url: window.location.href
      });
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking?.id || !booking?.customer_phone) return;

    try {
      setCanceling(true);
      const canceledBooking = await publicApi.cancelBooking(booking.id, booking.customer_phone);
      setBooking(canceledBooking);
      setShowCancelConfirm(false);
    } catch (err: any) {
      setError(err.detail || 'Failed to cancel booking');
    } finally {
      setCanceling(false);
    }
  };

  const canCancelBooking = () => {
    if (!booking) return false;
    if (booking.status !== 'confirmed' && booking.status !== 'pending') return false;
    
    // Check if booking is more than 1 hour in the future
    const now = new Date();
    const bookingTime = new Date(booking.starts_at);
    const timeDiff = bookingTime.getTime() - now.getTime();
    const hoursUntilBooking = timeDiff / (1000 * 60 * 60);
    
    return hoursUntilBooking > 1;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The booking you are looking for does not exist.'}</p>
          <div className="space-x-4">
            <Link to="/booking-search" className="text-blue-600 hover:text-blue-800 font-medium">
              Search for your booking
            </Link>
            <span className="text-gray-400">|</span>
            <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
              Go back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const business = stateData?.business;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Booking Confirmation</h1>
            <p className="text-gray-600">Your booking has been confirmed</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600 mr-4" />
            <div>
              <h2 className="text-lg font-semibold text-green-900">Booking Confirmed!</h2>
              <p className="text-green-700">
                Your booking has been successfully created. You will receive a confirmation call soon.
              </p>
            </div>
          </div>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Header */}
          <div className="bg-blue-50 px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {booking.service_name || 'Service'}
                </h3>
                {business && (
                  <p className="text-sm text-gray-600">{business.name}</p>
                )}
              </div>
              <div className="text-right">
                <span className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                  ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                `}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date & Time */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <CalendarDaysIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-medium text-gray-900">
                      {new Date(booking.starts_at).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatTime(booking.starts_at)} - {formatTime(booking.ends_at)}
                    </p>
                    {business?.timezone && business?.timezone !== 'UTC' && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {business.name} {t('public.confirmation.localTime')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <UserIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Party Size</p>
                    <p className="font-medium text-gray-900">
                      {booking.party_size} {booking.party_size === 1 ? 'person' : 'people'}
                    </p>
                  </div>
                </div>

                {booking.service_price_minor && booking.service_price_minor > 0 && (
                  <div className="flex items-start">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="font-medium text-gray-900">
                        {formatPrice(booking.service_price_minor, business?.currency)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer & Contact */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <UserIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-medium text-gray-900">{booking.customer_name}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{booking.customer_phone}</p>
                  </div>
                </div>

                {booking.customer_email && (
                  <div className="flex items-start">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{booking.customer_email}</p>
                    </div>
                  </div>
                )}


              </div>
            </div>

            {/* Business Address */}
            {business && (business.address_line1 || business.city) && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-start">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <div className="font-medium text-gray-900">
                      {business.address_line1 && <div>{business.address_line1}</div>}
                      {business.address_line2 && <div>{business.address_line2}</div>}
                      {business.city && (
                        <div>
                          {business.city}
                          {business.postal_code && `, ${business.postal_code}`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Booking ID */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Booking ID</p>
                  <p className="font-mono text-sm text-gray-900">{booking.id}</p>
                </div>
                <button
                  onClick={copyBookingId}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                  {copied ? 'Copied!' : 'Copy ID'}
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={shareBooking}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center"
              >
                <ShareIcon className="h-4 w-4 mr-2" />
                Share Booking
              </button>
              
              {canCancelBooking() && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-200 font-medium flex items-center justify-center"
                >
                  <XCircleIcon className="h-4 w-4 mr-2" />
                  Cancel Booking
                </button>
              )}
            </div>

            {!canCancelBooking() && booking.status !== 'cancelled' && (
              <p className="text-xs text-gray-500 text-center mt-2">
                Bookings can only be cancelled up to 1 hour before the appointment.
              </p>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 text-blue-400">ℹ️</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Important Information</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Please arrive 5-10 minutes before your scheduled time</li>
                  <li>You will receive a confirmation call from the business</li>
                  <li>If you need to make changes, please call the business directly</li>
                  <li>Cancellations must be made at least 1 hour in advance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Cancel Booking</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors duration-200"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={canceling}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
              >
                {canceling ? 'Canceling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicBookingConfirmation; 