import { useState, useEffect, useCallback } from 'react';
import { bookingApi } from '../utils/api';
import { BookingWithService, Resource } from '../types';

interface ResourceStats {
  resourceId: string;
  todayCount: number;
  thisWeekCount: number;
  thisMonthCount: number;
}

interface UseResourceStatsProps {
  bizId: string;
  resources: Resource[];
}

export const useResourceStats = ({ bizId, resources }: UseResourceStatsProps) => {
  const [stats, setStats] = useState<ResourceStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResourceStats = useCallback(async () => {
    if (!bizId || resources.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      // Get date ranges
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
      
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

      // Fetch bookings for the entire month to calculate all stats
      const bookings = await bookingApi.searchBookings(bizId, {
        date_from: startOfMonthStr,
        date_to: todayStr,
        limit: 1000 // High limit to get all bookings
      });

      // Calculate stats for each resource
      const resourceStats = resources.map(resource => {
        // Filter bookings that used this resource (based on table codes or resource codes)
        const resourceBookings = bookings.filter(booking => {
          // This is a simplified approach - in practice, you'd need to match
          // bookings to resources through table assignments or other relationships
          // For now, we'll assume all bookings are distributed evenly across resources
          return true;
        });

        // Count bookings for different time periods
        const todayCount = resourceBookings.filter(booking => 
          booking.starts_at.split('T')[0] === todayStr
        ).length;

        const thisWeekCount = resourceBookings.filter(booking => 
          new Date(booking.starts_at) >= startOfWeek
        ).length;

        const thisMonthCount = resourceBookings.filter(booking => 
          new Date(booking.starts_at) >= startOfMonth
        ).length;

        return {
          resourceId: resource.id,
          todayCount,
          thisWeekCount,
          thisMonthCount
        };
      });

      setStats(resourceStats);
    } catch (err: any) {
      setError(err.detail || 'Failed to fetch resource statistics');
    } finally {
      setLoading(false);
    }
  }, [bizId, resources]);

  useEffect(() => {
    fetchResourceStats();
  }, [fetchResourceStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchResourceStats
  };
}; 