import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  ArrowPathIcon,
  XMarkIcon,
  InformationCircleIcon,
  CalendarDaysIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { useBusinessSubscription } from '../../hooks/useBusinessSubscription';
import { useTranslation } from '../../hooks/useTranslation';
import { SubscriptionPlan, SubscriptionStatus } from '../../types';

interface SubscriptionManagementProps {
  businessId: string;
  className?: string;
}

const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ businessId, className = '' }) => {
  const { t } = useTranslation();
  const {
    subscription: currentSubscription,
    plans,
    plansLoading,
    hasActiveSubscription,
    isCanceledButActive,
    loading,
    error,
    updating,
    updateSubscription,
    refetch,
  } = useBusinessSubscription({ businessId });

  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<'plan' | 'cancel' | 'resume' | null>(null);

  const availablePlans = useMemo(() => {
    const flattened = Object.values(plans).flat();
    return flattened.sort((a, b) => a.price - b.price);
  }, [plans]);

  useEffect(() => {
    if (currentSubscription?.plan_id) {
      setSelectedPlanId(currentSubscription.plan_id);
    }
  }, [currentSubscription?.plan_id]);

  useEffect(() => {
    if (successMessage) {
      const timeout = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [successMessage]);

  const planChanged = Boolean(selectedPlanId && selectedPlanId !== currentSubscription?.plan_id);

  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return 'text-green-600 bg-green-100';
      case SubscriptionStatus.TRIALING:
        return 'text-blue-600 bg-blue-100';
      case SubscriptionStatus.PAST_DUE:
        return 'text-orange-600 bg-orange-100';
      case SubscriptionStatus.CANCELED:
        return 'text-red-600 bg-red-100';
      case SubscriptionStatus.INCOMPLETE:
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return t('subscription.status.active');
      case SubscriptionStatus.TRIALING:
        return t('subscription.status.trialing');
      case SubscriptionStatus.PAST_DUE:
        return t('subscription.status.pastDue');
      case SubscriptionStatus.CANCELED:
        return t('subscription.status.canceled');
      case SubscriptionStatus.INCOMPLETE:
        return t('subscription.status.incomplete');
      default:
        return status;
    }
  };

  const mapPlanNameKey = (planName: string): string | null => {
    const lower = planName.toLowerCase();
    if (lower.includes('solo')) return 'pricing.solo.name';
    if (lower.includes('team')) return 'pricing.team.name';
    if (lower.includes('business')) return 'pricing.business.name';
    return null;
  };

  const mapPlanDescriptionKey = (planName: string): string | null => {
    const lower = planName.toLowerCase();
    if (lower.includes('solo')) return 'pricing.solo.description';
    if (lower.includes('team') || lower.includes('pro')) return 'pricing.team.description';
    if (lower.includes('business')) return 'pricing.business.description';
    return null;
  };

  const getPlanFeatures = (plan: SubscriptionPlan) => {
    if (plan.features && plan.features.length > 0) {
      return plan.features;
    }

    const lower = plan.name.toLowerCase();
    if (lower.includes('solo')) {
      return [
        'pricing.solo.feature1',
        'pricing.solo.feature2',
        'pricing.solo.feature3',
        'pricing.solo.feature4',
        'pricing.solo.feature5',
        'pricing.solo.feature6',
      ];
    }
    if (lower.includes('team') || lower.includes('pro')) {
      return [
        'pricing.team.feature1',
        'pricing.team.feature2',
        'pricing.team.feature3',
        'pricing.team.feature4',
        'pricing.team.feature5',
        'pricing.team.feature6',
      ];
    }
    if (lower.includes('business')) {
      return [
        'pricing.business.feature1',
        'pricing.business.feature2',
        'pricing.business.feature3',
        'pricing.business.feature4',
        'pricing.business.feature5',
      ];
    }
    return [];
  };

  const getIntervalLabel = (interval: string) => (
    interval === 'year' ? t('pricing.yearly.short') : t('pricing.monthly.short')
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(t('common.locale'), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handlePlanUpdate = async () => {
    if (!planChanged) {
      return;
    }

    try {
      setActiveAction('plan');
      setSuccessMessage(null);
      await updateSubscription({ plan_id: selectedPlanId });
      setSuccessMessage(t('subscription.management.planUpdated'));
    } catch (error) {
      // Error handled via hook state
    } finally {
      setActiveAction(null);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setActiveAction('cancel');
      setSuccessMessage(null);
      await updateSubscription({ cancel_at_period_end: true });
      setShowCancelConfirm(false);
      setSuccessMessage(t('subscription.management.cancellationScheduled'));
    } catch (error) {
      // Error handled via hook state
    } finally {
      setActiveAction(null);
    }
  };

  const handleResumeSubscription = async () => {
    try {
      setActiveAction('resume');
      setSuccessMessage(null);
      await updateSubscription({ cancel_at_period_end: false });
      setSuccessMessage(t('subscription.management.resumed'));
    } catch (error) {
      // Error handled via hook state
    } finally {
      setActiveAction(null);
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">{t('subscription.error.title')}</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={refetch}
            className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium flex items-center"
          >
            <ArrowPathIcon className="w-4 h-4 mr-1" />
            {t('subscription.error.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!currentSubscription) {
    return (
      <div className={`${className}`}>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="text-center">
            <CreditCardIcon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              {t('subscription.noSubscription.title')}
            </h3>
            <p className="text-blue-700 mb-4">
              {t('subscription.noSubscription.subtitle')}
            </p>
            <button
              onClick={() => window.location.href = '/subscription-plans'}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('subscription.noSubscription.viewPlans')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {t('subscription.management.title')}
      </h2>

      {/* Current Subscription Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <h3 className="text-lg font-medium text-gray-900">
                {currentSubscription.plan_name || t('subscription.management.currentPlan')}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentSubscription.status)}`}>
                {getStatusText(currentSubscription.status)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {currentSubscription.price && (
                <div className="flex items-center space-x-2">
                  <BanknotesIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{t('subscription.management.price')}:</span>
                  <span className="font-medium">
                    €{currentSubscription.price.toFixed(2)} / {getIntervalLabel(currentSubscription.interval || 'month')}
                  </span>
                </div>
              )}

              {currentSubscription.current_period_end && (
                <div className="flex items-center space-x-2">
                  <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{t('subscription.management.nextBilling')}:</span>
                  <span className="font-medium">
                    {formatDate(currentSubscription.current_period_end)}
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{t('subscription.management.tier')}:</span>
                <span className="font-medium capitalize">{currentSubscription.tier}</span>
              </div>
            </div>

            {/* Cancellation Notice */}
            {isCanceledButActive && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <InformationCircleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800">
                      {t('subscription.management.canceledNotice')}
                    </p>
                    {currentSubscription.current_period_end && (
                      <p className="text-sm text-yellow-700 mt-1">
                        {t('subscription.management.accessUntil')}: {formatDate(currentSubscription.current_period_end)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end space-y-3">
            <button
              onClick={refetch}
              disabled={loading}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center"
            >
              <ArrowPathIcon className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              {t('subscription.management.refresh')}
            </button>

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700"
              >
                {successMessage}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Plan Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-md font-semibold text-gray-900">
              {t('subscription.management.planOptions')}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {t('subscription.management.planOptionsDescription')}
            </p>
          </div>

          {planChanged && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handlePlanUpdate}
              disabled={updating || activeAction === 'plan'}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating && activeAction === 'plan' ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                  {t('subscription.management.updatingPlan')}
                </>
              ) : (
                <>
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  {t('subscription.management.updatePlan')}
                </>
              )}
            </motion.button>
          )}
        </div>

        {plansLoading ? (
          <div className="flex items-center justify-center py-10 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            {t('subscription.management.loadingPlans')}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availablePlans.map(plan => {
              const isCurrentPlan = currentSubscription.plan_id === plan.id;
              const isSelected = selectedPlanId === plan.id;

              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`relative text-left rounded-xl border p-5 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isSelected ? 'border-blue-500 shadow-lg bg-blue-50/50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-semibold text-gray-900">
                        {mapPlanNameKey(plan.name) ? t(mapPlanNameKey(plan.name)!) : plan.name}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {mapPlanDescriptionKey(plan.name) ? t(mapPlanDescriptionKey(plan.name)!) : plan.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-bold text-gray-900">
                        €{plan.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">
                        / {getIntervalLabel(plan.interval)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    {getPlanFeatures(plan).slice(0, 4).map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        <span>{feature.startsWith('pricing.') ? t(feature) : feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center space-x-2">
                    {isCurrentPlan && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                        {t('subscription.management.currentPlanBadge')}
                      </span>
                    )}
                    {isSelected && !isCurrentPlan && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                        {t('subscription.management.selectedPlanBadge')}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}

            {availablePlans.length === 0 && (
              <div className="col-span-full text-sm text-gray-600 bg-gray-50 border border-dashed border-gray-200 rounded-lg p-6 text-center">
                {t('subscription.management.noPlansAvailable')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cancellation Controls */}
      {hasActiveSubscription && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-md font-semibold text-gray-900">
                {t('subscription.management.billingActions')}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {isCanceledButActive ? t('subscription.management.resumeDescription') : t('subscription.management.cancelDescription')}
              </p>
            </div>

            {isCanceledButActive ? (
              <button
                onClick={handleResumeSubscription}
                disabled={updating || activeAction === 'resume'}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-green-300 text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating && activeAction === 'resume' ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                    {t('subscription.management.resuming')}
                  </>
                ) : (
                  <>
                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                    {t('subscription.management.resume')}
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={updating}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                {t('subscription.management.cancelAtPeriodEnd')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Features List */}
      {currentSubscription.features && currentSubscription.features.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-3">
            {t('subscription.management.includedFeatures')}
          </h4>
          <ul className="space-y-2">
            {currentSubscription.features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCancelConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">
                  {t('subscription.cancel.title')}
                </h3>
              </div>

              <p className="text-gray-600 mb-6">
                {t('subscription.cancel.confirmation')}
              </p>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleCancelSubscription}
                  disabled={updating && activeAction === 'cancel'}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {updating && activeAction === 'cancel' ? t('subscription.cancel.canceling') : t('subscription.cancel.confirm')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubscriptionManagement; 