import { useState, useEffect } from 'react';
import { businessApi } from '../utils/api';
import { Business, BusinessUpdate } from '../types';

interface UseBusinessProps {
  bizId: string;
}

export const useBusiness = ({ bizId }: UseBusinessProps) => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchBusiness = async () => {
    try {
      setLoading(true);
      setError(null);
      const businessData = await businessApi.getBusiness(bizId);
      setBusiness(businessData);
    } catch (err: any) {
      setError(err.detail || 'Failed to fetch business details');
    } finally {
      setLoading(false);
    }
  };

  const updateBusiness = async (updates: BusinessUpdate) => {
    try {
      setUpdating(true);
      setError(null);
      const updatedBusiness = await businessApi.updateBusiness(bizId, updates);
      setBusiness(updatedBusiness);
      return updatedBusiness;
    } catch (err: any) {
      setError(err.detail || 'Failed to update business');
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (bizId) {
      fetchBusiness();
    }
  }, [bizId]);

  return {
    business,
    loading,
    error,
    updating,
    updateBusiness,
    refetch: fetchBusiness,
  };
}; 