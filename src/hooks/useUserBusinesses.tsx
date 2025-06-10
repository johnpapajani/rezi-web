import { useState, useEffect } from 'react';
import { businessApi } from '../utils/api';
import { BusinessWithRole } from '../types';

export const useUserBusinesses = () => {
  const [businesses, setBusinesses] = useState<BusinessWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);
      const businessesData = await businessApi.listUserBusinesses();
      setBusinesses(businessesData);
    } catch (err: any) {
      setError(err.detail || 'Failed to fetch businesses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  return {
    businesses,
    loading,
    error,
    refetch: fetchBusinesses,
  };
}; 