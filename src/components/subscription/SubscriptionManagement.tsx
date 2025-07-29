import React, { useState } from 'react';
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
import { useSubscription } from '../../hooks/useSubscription';
import { useTranslation } from '../../hooks/useTranslation';
import { SubscriptionPlan, SubscriptionStatus } from '../../types';
import PaymentModal from './PaymentModal';

interface SubscriptionManagementProps {
  className?: string;
}

const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const {
    currentSubscription,
    plans,
    hasActiveSubscription,
    isCanceledButActive,
    loading,
    error,
    updating,
    canceling,
    updateSubscription,
    cancelSubscription,
    refetch,
  } = useSubscription();

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Get all plans as flat array
  const allPlans = Object.values(plans).flat();

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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(t('common.locale'), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleUpgrade = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowUpgradeModal(true);
  };

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription();
      setShowCancelConfirm(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleUpgradeSuccess = () => {
    setShowUpgradeModal(false);
    setSelectedPlan(null);
    refetch();
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
                    €{currentSubscription.price.toFixed(2)} / {currentSubscription.interval}
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
        </div>

        {/* Actions */}
        {hasActiveSubscription && (
          <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-200">
            {!isCanceledButActive && (
              <>
                <button
                  onClick={() => {
                    // Find upgrade options
                    const upgradePlans = allPlans.filter(plan => 
                      plan.price > (currentSubscription.price || 0)
                    );
                    if (upgradePlans.length > 0) {
                      handleUpgrade(upgradePlans[0]);
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  {t('subscription.management.upgrade')}
                </button>

                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  {t('subscription.management.cancel')}
                </button>
              </>
            )}

            <button
              onClick={refetch}
              disabled={loading}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center"
            >
              <ArrowPathIcon className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              {t('subscription.management.refresh')}
            </button>
          </div>
        )}
      </div>

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

      {/* Upgrade Modal */}
      {selectedPlan && (
        <PaymentModal
          isOpen={showUpgradeModal}
          onClose={() => {
            setShowUpgradeModal(false);
            setSelectedPlan(null);
          }}
          plan={selectedPlan}
          onSuccess={handleUpgradeSuccess}
        />
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
                  disabled={canceling}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {canceling ? t('subscription.cancel.canceling') : t('subscription.cancel.confirm')}
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