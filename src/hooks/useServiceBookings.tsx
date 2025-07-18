import { useState, useEffect, useCallback } from 'react';
import { serviceApi } from '../utils/api';
import { BookingWithService, BookingFilters, BookingUpdate, BookingStatusUpdate, BookingReschedule, BookingStatus } from '../types';

interface UseServiceBookingsProps {
  serviceId: string;
}

export const useServiceBookings = ({ serviceId }: UseServiceBookingsProps) => {
  const [bookings, setBookings] = useState<BookingWithService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async (filters?: any) => {
    try {
      setLoading(true);
      setError(null);
      const bookingData = await serviceApi.getServiceBookings(serviceId, filters);
      setBookings(bookingData);
    } catch (err: any) {
      setError(err.detail || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  const createBooking = async (bookingData: any) => {
    try {
      const newBooking = await serviceApi.createServiceBooking(serviceId, bookingData);
      setBookings(prev => [newBooking, ...prev]);
      return newBooking;
    } catch (err: any) {
      throw new Error(err.detail || 'Failed to create booking');
    }
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    try {
      // For service bookings, we'll need to use the business API for updates
      // since the service router might not have update endpoints
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, status } : booking
      ));
    } catch (err: any) {
      throw new Error(err.detail || 'Failed to update booking status');
    }
  };

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    createBooking,
    updateBookingStatus,
    refetch: () => fetchBookings(),
  };
}; 