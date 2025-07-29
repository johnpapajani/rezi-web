import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CheckIcon,
  XMarkIcon,
  CreditCardIcon,
  StarIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useSubscription } from '../../hooks/useSubscription';
import { useTranslation } from '../../hooks/useTranslation';
import { SubscriptionPlan } from '../../types';
import PaymentModal from '../subscription/PaymentModal';

const SubscriptionPlans: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { plans, plansLoading, error } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Get all plans as a flat array and sort by price
  const allPlans = Object.values(plans).flat().sort((a, b) => a.price - b.price);

  // Find the free plan (price = 0)
  const freePlan = allPlans.find(plan => plan.price === 0);
  const paidPlans = allPlans.filter(plan => plan.price > 0);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (plan.price === 0) {
      // For free plan, navigate directly to dashboard
      navigate('/dashboard');
      return;
    }
    
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handleSkipForNow = () => {
    navigate('/dashboard');
  };

  const getTierBadge = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'basic':
        return (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <StarIcon className="w-4 h-4 mr-1" />
            {t('subscription.tiers.basic')}
          </div>
        );
      case 'standard':
        return (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
            <ShieldCheckIcon className="w-4 h-4 mr-1" />
            {t('subscription.tiers.standard')}
          </div>
        );
      case 'premium':
        return (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            <SparklesIcon className="w-4 h-4 mr-1" />
            {t('subscription.tiers.premium')}
          </div>
        );
      default:
        return null;
    }
  };

  const getPlanCardStyle = (plan: SubscriptionPlan) => {
    if (plan.tier?.toLowerCase() === 'premium') {
      return 'border-2 border-gradient-to-r from-yellow-400 to-orange-500 shadow-xl relative overflow-hidden';
    }
    if (plan.tier?.toLowerCase() === 'standard') {
      return 'border-2 border-purple-300 shadow-lg';
    }
    return 'border border-gray-200 shadow-sm';
  };

  if (plansLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('subscription.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {t('subscription.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">R</span>
                </div>
                <span className="ml-3 text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Rezi
                </span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {t('subscription.welcome.title')}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('subscription.welcome.subtitle')}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Free Plan */}
          {freePlan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 relative"
            >
              <div className="text-center mb-6">
                {getTierBadge(freePlan.tier || 'basic')}
                <h3 className="text-2xl font-bold text-gray-900 mt-4">{freePlan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">FREE</span>
                  <span className="text-gray-500 ml-2">{t('subscription.pricing.forever')}</span>
                </div>
                {freePlan.description && (
                  <p className="text-gray-600 mt-4">{freePlan.description}</p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {freePlan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(freePlan)}
                className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                {t('subscription.actions.getStarted')}
              </button>
            </motion.div>
          )}

          {/* Paid Plans */}
          {paidPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`bg-white rounded-2xl p-8 relative ${getPlanCardStyle(plan)}`}
            >
              {/* Premium badge */}
              {plan.tier?.toLowerCase() === 'premium' && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-bl-lg rounded-tr-2xl text-sm font-medium">
                  {t('subscription.badges.mostPopular')}
                </div>
              )}

              <div className="text-center mb-6">
                {getTierBadge(plan.tier || 'standard')}
                <h3 className="text-2xl font-bold text-gray-900 mt-4">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    €{plan.price.toFixed(2)}
                  </span>
                  <span className="text-gray-500 ml-2">
                    / {plan.interval === 'month' ? t('subscription.pricing.month') : t('subscription.pricing.year')}
                  </span>
                </div>
                                 {plan.trial_days && plan.trial_days > 0 && (
                   <div className="mt-2 text-sm text-green-600 font-medium">
                     {t('subscription.pricing.freeTrial')} {plan.trial_days} {t('common.days')}
                   </div>
                 )}
                {plan.description && (
                  <p className="text-gray-600 mt-4">{plan.description}</p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <CheckIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center ${
                  plan.tier?.toLowerCase() === 'premium'
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 shadow-lg'
                    : plan.tier?.toLowerCase() === 'standard'
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <CreditCardIcon className="w-5 h-5 mr-2" />
                {t('subscription.actions.subscribe')}
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Skip option */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <button
            onClick={handleSkipForNow}
            className="text-gray-600 hover:text-gray-800 font-medium underline"
          >
            {t('subscription.actions.skipForNow')}
          </button>
        </motion.div>
      </div>

      {/* Payment Modal */}
      {selectedPlan && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPlan(null);
          }}
          plan={selectedPlan}
          onSuccess={() => {
            setShowPaymentModal(false);
            setSelectedPlan(null);
            navigate('/dashboard');
          }}
        />
      )}
    </div>
  );
};

export default SubscriptionPlans; 