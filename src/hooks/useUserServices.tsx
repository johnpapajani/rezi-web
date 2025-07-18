import { useState, useEffect } from 'react';
import { serviceApi } from '../utils/api';

interface ServiceWithBusiness {
  id: string;
  business_id: string;
  business_name: string;
  business_role: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price_minor: number;
  is_active: boolean;
  table_count: number;
  recent_bookings_count: number;
  created_at: string;
  updated_at: string;
}

export const useUserServices = () => {
  const [services, setServices] = useState<ServiceWithBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const servicesData = await serviceApi.getUserServices();
      setServices(servicesData);
    } catch (err: any) {
      setError(err.detail || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserServices();
  }, []);

  return {
    services,
    loading,
    error,
    refetch: fetchUserServices,
  };
}; 