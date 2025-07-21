import { useState, useCallback } from 'react';
import { serviceApi } from '../utils/api';
import { BookingWithService, BookingCreate, BookingStatus } from '../types';

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

  const createBooking = async (bookingData: BookingCreate) => {
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
      const updatedBooking = await serviceApi.updateServiceBookingStatus(serviceId, bookingId, { status });
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? updatedBooking : booking
      ));
      return updatedBooking;
    } catch (err: any) {
      throw new Error(err.detail || 'Failed to update booking status');
    }
  };

  const updateBooking = async (bookingId: string, updates: any) => {
    try {
      const updatedBooking = await serviceApi.updateServiceBooking(serviceId, bookingId, updates);
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? updatedBooking : booking
      ));
      return updatedBooking;
    } catch (err: any) {
      throw new Error(err.detail || 'Failed to update booking');
    }
  };

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    createBooking,
    updateBookingStatus,
    updateBooking,
    refetch: () => fetchBookings(),
  };
}; 