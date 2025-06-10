import { useState, useEffect, useCallback } from 'react';
import { bookingApi } from '../utils/api';
import { BookingWithService, BookingFilters, BookingUpdate, BookingStatusUpdate, BookingReschedule, BookingStatus } from '../types';

interface UseBookingsProps {
  bizId: string;
}

export const useBookings = ({ bizId }: UseBookingsProps) => {
  const [bookings, setBookings] = useState<BookingWithService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchBookings = useCallback(async (filters?: BookingFilters) => {
    try {
      setLoading(true);
      setError(null);
      const bookingData = await bookingApi.searchBookings(bizId, filters);
      setBookings(bookingData);
    } catch (err: any) {
      setError(err.detail || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, [bizId]);

  const updateBooking = async (bookingId: string, updates: BookingUpdate) => {
    try {
      const updatedBooking = await bookingApi.updateBooking(bizId, bookingId, updates);
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? updatedBooking : booking
      ));
      return updatedBooking;
    } catch (err: any) {
      throw new Error(err.detail || 'Failed to update booking');
    }
  };

  const updateBookingStatus = async (bookingId: string, statusUpdate: BookingStatusUpdate) => {
    try {
      const updatedBooking = await bookingApi.updateBookingStatus(bizId, bookingId, statusUpdate);
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? updatedBooking : booking
      ));
      return updatedBooking;
    } catch (err: any) {
      throw new Error(err.detail || 'Failed to update booking status');
    }
  };

  const rescheduleBooking = async (bookingId: string, rescheduleData: BookingReschedule) => {
    try {
      const updatedBooking = await bookingApi.rescheduleBooking(bizId, bookingId, rescheduleData);
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? updatedBooking : booking
      ));
      return updatedBooking;
    } catch (err: any) {
      throw new Error(err.detail || 'Failed to reschedule booking');
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      await bookingApi.cancelBooking(bizId, bookingId);
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, status: BookingStatus.cancelled } : booking
      ));
    } catch (err: any) {
      throw new Error(err.detail || 'Failed to cancel booking');
    }
  };

  return {
    bookings,
    loading,
    error,
    searchBookings,
    updateBooking,
    updateBookingStatus,
    rescheduleBooking,
    cancelBooking,
    refetch: () => searchBookings(),
  };
};

export const useUpcomingBookings = ({ bizId }: UseBookingsProps) => {
  const [upcomingBookings, setUpcomingBookings] = useState<BookingWithService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUpcomingBookings = useCallback(async (daysAhead: number = 7, limit: number = 20) => {
    try {
      setLoading(true);
      setError(null);
      const bookingData = await bookingApi.getUpcomingBookings(bizId, daysAhead, limit);
      setUpcomingBookings(bookingData);
    } catch (err: any) {
      setError(err.detail || 'Failed to fetch upcoming bookings');
    } finally {
      setLoading(false);
    }
  }, [bizId]);

  useEffect(() => {
    fetchUpcomingBookings();
  }, [fetchUpcomingBookings]);

  return {
    upcomingBookings,
    loading,
    error,
    refetch: fetchUpcomingBookings,
  };
};

export const useCalendarBookings = ({ bizId }: UseBookingsProps) => {
  const [calendarBookings, setCalendarBookings] = useState<BookingWithService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendarBookings = useCallback(async (dateFrom?: string, dateTo?: string) => {
    try {
      setLoading(true);
      setError(null);
      const bookingData = await bookingApi.getCalendarBookings(bizId, dateFrom, dateTo);
      setCalendarBookings(bookingData);
    } catch (err: any) {
      setError(err.detail || 'Failed to fetch calendar bookings');
    } finally {
      setLoading(false);
    }
  }, [bizId]);

  return {
    calendarBookings,
    loading,
    error,
    fetchCalendarBookings,
    refetch: () => fetchCalendarBookings(),
  };
}; 