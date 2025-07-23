import { useState, useEffect } from 'react';
import { ServiceCategory } from '../types';
import { serviceApi } from '../utils/api';

interface UseServiceCategoriesReturn {
  categories: ServiceCategory[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useServiceCategories = (): UseServiceCategoriesReturn => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const categoriesData = await serviceApi.getServiceCategories();
      setCategories(categoriesData);
    } catch (err: any) {
      setError(err.detail || 'Failed to fetch service categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
}; 