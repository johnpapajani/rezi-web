import { useState, useEffect, useCallback } from 'react';
import { serviceApi } from '../utils/api';
import { ServiceOpenInterval, ServiceOpenIntervalCreate } from '../types';

interface UseServiceOpenIntervalsProps {
  serviceId: string;
}

export const useServiceOpenIntervals = ({ serviceId }: UseServiceOpenIntervalsProps) => {
  const [intervals, setIntervals] = useState<ServiceOpenInterval[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchIntervals = useCallback(async () => {
    if (!serviceId) return;
    
    try {
      setLoading(true);
      setError(null);
      const intervalsData = await serviceApi.getServiceOpenIntervals(serviceId);
      setIntervals(intervalsData);
    } catch (err: any) {
      setError(err.detail || 'Failed to fetch service open intervals');
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  const updateIntervals = async (newIntervals: ServiceOpenIntervalCreate[]) => {
    try {
      setUpdating(true);
      setError(null);
      await serviceApi.replaceServiceOpenIntervals(serviceId, newIntervals);
      // Refresh the intervals to get the server state
      await fetchIntervals();
    } catch (err: any) {
      setError(err.detail || 'Failed to update service open intervals');
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (serviceId) {
      fetchIntervals();
    }
  }, [serviceId, fetchIntervals]);

  return {
    intervals,
    loading,
    error,
    updating,
    updateIntervals,
    refetch: fetchIntervals,
  };
}; 