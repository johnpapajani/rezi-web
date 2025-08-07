import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CheckIcon,
  CreditCardIcon,
  StarIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  SparklesIcon,
  GlobeAltIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useSubscription } from '../../hooks/useSubscription';
import { useTranslation } from '../../hooks/useTranslation';
import { useUserBusinesses } from '../../hooks/useUserBusinesses';
import { SubscriptionPlan, BusinessRole } from '../../types';

const SubscriptionPlans: React.FC = () => {
  const navigate = useNavigate();
  const { t, currentLanguage, setLanguage, languages } = useTranslation();
  const { plans, plansLoading, error } = useSubscription();
  const { businesses, loading: businessesLoading } = useUserBusinesses();
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  // Check if user has any businesses they own/manage
  const ownedBusinesses = businesses.filter(business => 
    business.role === BusinessRole.owner || business.role === BusinessRole.manager
  );

  // Get all plans as a flat array
  const allPlans = Object.values(plans).flat();

  // Find the free plan (price = 0)
  const freePlan = allPlans.find(plan => plan.price === 0);
  
  // Filter paid plans by billing period and sort by price
  const paidPlans = allPlans
    .filter(plan => plan.price > 0 && plan.interval === billingPeriod)
    .sort((a, b) => a.price - b.price);

  // Calculate annual savings for display
  const getAnnualSavings = () => {
    const monthlyPlans = allPlans.filter(plan => plan.interval === 'month' && plan.price > 0);
    const yearlyPlans = allPlans.filter(plan => plan.interval === 'year' && plan.price > 0);
    
    if (monthlyPlans.length > 0 && yearlyPlans.length > 0) {
      // Find corresponding plans by tier
      const monthlyStandard = monthlyPlans.find(p => p.tier?.toLowerCase() === 'standard');
      const yearlyStandard = yearlyPlans.find(p => p.tier?.toLowerCase() === 'standard');
      
      if (monthlyStandard && yearlyStandard) {
        const monthlyYearlyPrice = monthlyStandard.price * 12;
        const savings = ((monthlyYearlyPrice - yearlyStandard.price) / monthlyYearlyPrice) * 100;
        return Math.round(savings);
      }
    }
    return 20; // Default savings percentage
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (ownedBusinesses.length === 0) {
      // No businesses - redirect to create one
      navigate('/business/create');
      return;
    }
    
    if (ownedBusinesses.length === 1) {
      // Single business - redirect to its subscription page
      navigate(`/business/${ownedBusinesses[0].id}/subscription/plans?plan=${plan.tier?.toLowerCase()}`);
      return;
    }
    
    // Multiple businesses - let user choose or go to first one
    navigate(`/business/${ownedBusinesses[0].id}/subscription/plans?plan=${plan.tier?.toLowerCase()}`);
  };

  const handleSkipForNow = () => {
    if (ownedBusinesses.length > 0) {
      navigate(`/business/${ownedBusinesses[0].id}`);
    } else {
      navigate('/dashboard');
    }
  };

  // Handle clicks outside language dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
          {/* Top bar with language switcher */}
          <div className="flex justify-end mb-6">
            {/* Language Switcher */}
            <div className="relative" ref={languageDropdownRef}>
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                <GlobeAltIcon className="h-4 w-4" />
                <span>{languages.find(lang => lang.code === currentLanguage)?.flag}</span>
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              
              <AnimatePresence>
                {isLanguageOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                  >
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => {
                          setLanguage(language.code);
                          setIsLanguageOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 ${
                          currentLanguage === language.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        <span>{language.flag}</span>
                        <span>{language.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 p-1 rounded-xl">
            <div className="flex">
              <button
                onClick={() => setBillingPeriod('month')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  billingPeriod === 'month'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('subscription.billing.monthly')}
              </button>
              <button
                onClick={() => setBillingPeriod('year')}
                className={`px-6 py-3 rounded-lg font-medium transition-all relative ${
                  billingPeriod === 'year'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('subscription.billing.annual')}
                <span className="absolute -top-2 -right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  -{getAnnualSavings()}%
                </span>
              </button>
            </div>
          </div>
        </div>

        <motion.div 
          key={billingPeriod}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-wrap justify-center gap-8"
        >
          {/* Free Plan */}
          {freePlan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 relative w-full max-w-sm"
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
               className={`bg-white rounded-2xl p-8 relative w-full max-w-sm ${getPlanCardStyle(plan)}`}
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
                   <div className="flex items-baseline justify-center">
                     <span className="text-4xl font-bold text-gray-900">
                       €{plan.price.toFixed(2)}
                     </span>
                     <span className="text-gray-500 ml-2">
                       / {plan.interval === 'month' ? t('subscription.pricing.month') : t('subscription.pricing.year')}
                     </span>
                   </div>
                   {billingPeriod === 'year' && (
                     <div className="mt-2 text-sm text-gray-600 text-center">
                       {(() => {
                         // Find corresponding monthly plan - try multiple matching strategies
                         let monthlyPlan = null;
                         
                         // Strategy 1: Match by tier (if available and not empty)
                         if (plan.tier && plan.tier.trim()) {
                           monthlyPlan = allPlans.find(p => 
                             p.tier === plan.tier && p.interval === 'month'
                           );
                         }
                         
                         // Strategy 2: If tier matching fails, try name-based matching
                         if (!monthlyPlan && plan.name) {
                           // Extract the base name (remove words like "Annual", "Yearly", "Monthly")
                           const baseName = plan.name
                             .replace(/\b(annual|yearly|monthly|month|year)\b/gi, '')
                             .trim();
                           
                           monthlyPlan = allPlans.find(p => 
                             p.interval === 'month' && 
                             p.name && 
                             p.name.replace(/\b(annual|yearly|monthly|month|year)\b/gi, '').trim() === baseName
                           );
                         }
                         
                         // Strategy 3: If still no match, try finding by plan ID pattern
                         if (!monthlyPlan && plan.id) {
                           // Try to find corresponding plan by ID pattern (replace yearly/annual with monthly)
                           const monthlyId = plan.id
                             .replace(/yearly|annual/gi, 'monthly')
                             .replace(/year/gi, 'month');
                           
                           monthlyPlan = allPlans.find(p => 
                             p.id === monthlyId || 
                             (p.interval === 'month' && p.id.includes(monthlyId.split('_')[0]))
                           );
                         }
                         
                         if (monthlyPlan) {
                           const monthlyYearlyPrice = monthlyPlan.price * 12;
                           const savings = monthlyYearlyPrice - plan.price;
                           const savingsPercent = Math.round((savings / monthlyYearlyPrice) * 100);
                           return (
                             <>
                               <span className="line-through text-gray-400">
                                 €{monthlyYearlyPrice.toFixed(2)} {t('subscription.pricing.perYear')}
                               </span>
                               <span className="ml-2 text-green-600 font-medium">
                                 {t('subscription.pricing.save')} €{savings.toFixed(2)} ({savingsPercent}%)
                               </span>
                             </>
                           );
                         }
                         return (
                           <span className="text-green-600 font-medium">
                             {t('subscription.pricing.save')} {getAnnualSavings()}%
                           </span>
                         );
                       })()}
                     </div>
                   )}
                 </div>
                                 {plan.trial_days && plan.trial_days > 0 ? (
                   <div className="mt-2 text-sm text-green-600 font-medium">
                     {t('subscription.pricing.freeTrial')} {plan.trial_days} {t('common.days')}
                   </div>
                 ) : null}
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
         </motion.div>

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

      {/* Information about new business-based subscriptions */}
      {businessesLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading your businesses...</p>
        </div>
      ) : ownedBusinesses.length === 0 ? (
        <div className="text-center py-8 bg-blue-50 rounded-lg border border-blue-200">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Create Your First Business</h3>
            <p className="text-blue-700 mb-4">
              Subscriptions are now managed per business. Create your first business to get started with a subscription plan.
            </p>
            <button
              onClick={() => navigate('/business/create')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Business
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-green-50 rounded-lg border border-green-200">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-green-900 mb-2">Manage Business Subscriptions</h3>
            <p className="text-green-700 mb-4">
              You have {ownedBusinesses.length} business{ownedBusinesses.length > 1 ? 'es' : ''}. Each business can have its own subscription plan.
            </p>
            <div className="space-y-2">
              {ownedBusinesses.map((business) => (
                <button
                  key={business.id}
                  onClick={() => navigate(`/business/${business.id}/subscription/plans`)}
                  className="block w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Manage {business.name} Subscription
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans; 