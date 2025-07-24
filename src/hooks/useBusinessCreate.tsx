import { useState } from 'react';
import { businessApi } from '../utils/api';
import { BusinessCreate, Business } from '../types';

export const useBusinessCreate = () => {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBusiness = async (businessData: BusinessCreate, generateQr: boolean = true): Promise<Business> => {
    try {
      setCreating(true);
      setError(null);
      
      const newBusiness = await businessApi.createBusiness(businessData, generateQr);
      return newBusiness;
    } catch (err: any) {
      const errorMessage = err.detail || 'Failed to create business';
      setError(errorMessage);
      throw err;
    } finally {
      setCreating(false);
    }
  };

  const clearError = () => setError(null);

  return {
    creating,
    error,
    createBusiness,
    clearError,
  };
}; 