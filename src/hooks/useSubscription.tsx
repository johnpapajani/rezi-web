import { useState, useEffect, useCallback } from 'react';
import { 
  SubscriptionPlans, 
  Subscription, 
  SubscriptionWithPrice, 
  SubscriptionCreate, 
  SubscriptionUpdate 
} from '../types';
import { subscriptionApi } from '../utils/api';

interface UseSubscriptionProps {
  autoFetch?: boolean;
}

export const useSubscription = ({ autoFetch = true }: UseSubscriptionProps = {}) => {
  const [plans, setPlans] = useState<SubscriptionPlans>({});
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionWithPrice | null>(null);
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

  // Fetch current subscription
  const fetchCurrentSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const subscription = await subscriptionApi.getCurrentSubscription();
      setCurrentSubscription(subscription);
    } catch (err: any) {
      // If no subscription found (404), that's expected behavior
      if (err.status === 404) {
        setCurrentSubscription(null);
      } else {
        setError(err.detail || 'Failed to fetch current subscription');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new subscription
  const createSubscription = async (subscriptionData: SubscriptionCreate): Promise<Subscription> => {
    try {
      setCreating(true);
      setError(null);
      const newSubscription = await subscriptionApi.createSubscription(subscriptionData);
      // Refresh current subscription to get full details
      await fetchCurrentSubscription();
      return newSubscription;
    } catch (err: any) {
      setError(err.detail || 'Failed to create subscription');
      throw err;
    } finally {
      setCreating(false);
    }
  };

  // Update current subscription
  const updateSubscription = async (subscriptionUpdate: SubscriptionUpdate): Promise<Subscription> => {
    try {
      setUpdating(true);
      setError(null);
      const updatedSubscription = await subscriptionApi.updateSubscription(subscriptionUpdate);
      // Refresh current subscription to get full details
      await fetchCurrentSubscription();
      return updatedSubscription;
    } catch (err: any) {
      setError(err.detail || 'Failed to update subscription');
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Cancel current subscription
  const cancelSubscription = async (): Promise<void> => {
    try {
      setCanceling(true);
      setError(null);
      await subscriptionApi.cancelSubscription();
      // Refresh current subscription to reflect cancellation
      await fetchCurrentSubscription();
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

  // Check if user has an active subscription
  const hasActiveSubscription = currentSubscription && 
    ['active', 'trialing'].includes(currentSubscription.status);

  // Check if subscription is canceled but still active until period end
  const isCanceledButActive = currentSubscription &&
    currentSubscription.cancel_at_period_end &&
    hasActiveSubscription;

  useEffect(() => {
    if (autoFetch) {
      fetchPlans();
      fetchCurrentSubscription();
    }
  }, [autoFetch, fetchPlans, fetchCurrentSubscription]);

  return {
    // Data
    plans,
    currentSubscription,
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
    fetchCurrentSubscription,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    
    // Utilities
    getAllPlans,
    clearError: () => setError(null),
    refetch: () => {
      fetchPlans();
      fetchCurrentSubscription();
    }
  };
}; 