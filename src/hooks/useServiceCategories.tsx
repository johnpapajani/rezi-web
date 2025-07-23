import { useState, useEffect, useCallback } from 'react';
import { ServiceCategoryLocalized } from '../types';
import { serviceApi } from '../utils/api';
import { useTranslation } from './useTranslation';

interface UseServiceCategoriesReturn {
  categories: ServiceCategoryLocalized[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useServiceCategories = (): UseServiceCategoriesReturn => {
  const [categories, setCategories] = useState<ServiceCategoryLocalized[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentLanguage } = useTranslation();

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const categoriesData = await serviceApi.getServiceCategories(currentLanguage);
      setCategories(categoriesData);
    } catch (err: any) {
      setError(err.detail || 'Failed to fetch service categories');
    } finally {
      setLoading(false);
    }
  }, [currentLanguage]);

  // Fetch categories on mount and whenever currentLanguage changes
  useEffect(() => {
    fetchCategories();
  }, [currentLanguage]); // Direct dependency on currentLanguage

  const refetch = useCallback(async () => {
    await fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch,
  };
}; 