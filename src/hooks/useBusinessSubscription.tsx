import { useState, useEffect, useCallback } from 'react';
import { 
  SubscriptionPlans, 
  Subscription, 
  SubscriptionWithPrice, 
  SubscriptionCreate, 
  SubscriptionUpdate 
} from '../types';
import { subscriptionApi } from '../utils/api';

interface UseBusinessSubscriptionProps {
  businessId: string;
  autoFetch?: boolean;
}

export const useBusinessSubscription = ({ businessId, autoFetch = true }: UseBusinessSubscriptionProps) => {
  const [plans, setPlans] = useState<SubscriptionPlans>({});
  const [subscription, setSubscription] = useState<SubscriptionWithPrice | null>(null);
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [canceling, setCanceling] = useState(false);

  // Fetch subscription plans
  const fetchPlans = useCallback(async () => {
    try {
      setPlansLoading(true);
      setError(null);
      const plansData = await subscriptionApi.getPlans();
      setPlans(plansData);
    } catch (err: any) {
      setError(err.detail || 'Failed to fetch subscription plans');
    } finally {
      setPlansLoading(false);
    }
  }, []);

  // Fetch business subscription
  const fetchBusinessSubscription = useCallback(async () => {
    if (!businessId) {
      setSubscription(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const businessSubscription = await subscriptionApi.getBusinessSubscription(businessId);
      setSubscription(businessSubscription);
    } catch (err: any) {
      // If no subscription found (404), that's expected behavior
      if (err.status === 404) {
        setSubscription(null);
      } else {
        setError(err.detail || 'Failed to fetch business subscription');
      }
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  // Create a new subscription for the business
  const createSubscription = async (subscriptionData: SubscriptionCreate): Promise<Subscription> => {
    try {
      setCreating(true);
      setError(null);
      
      // Ensure businessId is included in the subscription data
      const dataWithBusinessId = {
        ...subscriptionData,
        business_id: businessId
      };
      
      const newSubscription = await subscriptionApi.createSubscription(dataWithBusinessId);
      // Refresh business subscription to get full details
      await fetchBusinessSubscription();
      return newSubscription;
    } catch (err: any) {
      setError(err.detail || 'Failed to create subscription');
      throw err;
    } finally {
      setCreating(false);
    }
  };

  // Update business subscription
  const updateSubscription = async (subscriptionUpdate: SubscriptionUpdate): Promise<Subscription> => {
    try {
      setUpdating(true);
      setError(null);
      const updatedSubscription = await subscriptionApi.updateBusinessSubscription(businessId, subscriptionUpdate);
      // Refresh business subscription to get full details
      await fetchBusinessSubscription();
      return updatedSubscription;
    } catch (err: any) {
      setError(err.detail || 'Failed to update subscription');
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Cancel business subscription
  const cancelSubscription = async (): Promise<void> => {
    try {
      setCanceling(true);
      setError(null);
      await subscriptionApi.cancelBusinessSubscription(businessId);
      // Refresh business subscription to reflect cancellation
      await fetchBusinessSubscription();
    } catch (err: any) {
      setError(err.detail || 'Failed to cancel subscription');
      throw err;
    } finally {
      setCanceling(false);
    }
  };

  // Get plans as a flat array for easier rendering
  const getAllPlans = useCallback(() => {
    const allPlans = [];
    for (const productPlans of Object.values(plans)) {
      allPlans.push(...productPlans);
    }
    return allPlans;
  }, [plans]);

  // Check if business has an active subscription
  const hasActiveSubscription = subscription && 
    ['active', 'trialing'].includes(subscription.status);

  // Check if subscription is canceled but still active until period end
  const isCanceledButActive = subscription &&
    subscription.cancel_at_period_end &&
    hasActiveSubscription;

  useEffect(() => {
    if (autoFetch && businessId) {
      fetchPlans();
      fetchBusinessSubscription();
    }
  }, [autoFetch, businessId, fetchPlans, fetchBusinessSubscription]);

  return {
    // Data
    plans,
    subscription,
    currentSubscription: subscription, // Alias for backward compatibility
    hasActiveSubscription,
    isCanceledButActive,
    
    // Loading states
    loading,
    plansLoading,
    creating,
    updating,
    canceling,
    
    // Error state
    error,
    
    // Actions
    fetchPlans,
    fetchBusinessSubscription,
    fetchCurrentSubscription: fetchBusinessSubscription, // Alias for backward compatibility
    createSubscription,
    updateSubscription,
    cancelSubscription,
    
    // Utilities
    getAllPlans,
    clearError: () => setError(null),
    refetch: () => {
      fetchPlans();
      fetchBusinessSubscription();
    }
  };
};

// Legacy hook for backward compatibility (deprecated)
export const useSubscription = ({ autoFetch = true }: { autoFetch?: boolean } = {}) => {
  console.warn('useSubscription is deprecated. Use useBusinessSubscription with a business ID instead.');
  
  const [plans, setPlans] = useState<SubscriptionPlans>({});
  const [error, setError] = useState<string | null>(null);
  const [plansLoading, setPlansLoading] = useState(false);

  // Only fetch plans for backward compatibility
  const fetchPlans = useCallback(async () => {
    try {
      setPlansLoading(true);
      setError(null);
      const plansData = await subscriptionApi.getPlans();
      setPlans(plansData);
    } catch (err: any) {
      setError(err.detail || 'Failed to fetch subscription plans');
    } finally {
      setPlansLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchPlans();
    }
  }, [autoFetch, fetchPlans]);

  return {
    plans,
    plansLoading,
    error,
    fetchPlans,
    // Stub methods that throw errors to encourage migration
    currentSubscription: null,
    hasActiveSubscription: false,
    isCanceledButActive: false,
    loading: false,
    creating: false,
    updating: false,
    canceling: false,
    fetchCurrentSubscription: () => Promise.reject(new Error('Use useBusinessSubscription instead')),
    createSubscription: () => Promise.reject(new Error('Use useBusinessSubscription instead')),
    updateSubscription: () => Promise.reject(new Error('Use useBusinessSubscription instead')),
    cancelSubscription: () => Promise.reject(new Error('Use useBusinessSubscription instead')),
    getAllPlans: () => Object.values(plans).flat(),
    clearError: () => setError(null),
    refetch: fetchPlans
  };
};