import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckIcon,
  CreditCardIcon,
  StarIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  SparklesIcon,
  ArrowLeftIcon,
  GlobeAltIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';
import { pricingPlans } from '../../data/content';
import PaymentModal from '../subscription/PaymentModal';

const BusinessSubscriptionPlans: React.FC = () => {
  const { bizId } = useParams<{ bizId: string }>();
  const navigate = useNavigate();
  const { t, currentLanguage, setLanguage, languages } = useTranslation();
  
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  const handleSelectPlan = (plan: any) => {
    // Create subscription plan object for PaymentModal
    const subscriptionPlan = {
      id: plan.id.toString(),
      name: t(plan.name),
      price: billingPeriod === 'yearly' ? parseFloat(plan.yearlyPrice) : parseFloat(plan.price),
      interval: billingPeriod === 'yearly' ? 'year' : 'month',
      features: plan.features.map((feature: string) => t(feature)),
      tier: plan.id === 2 ? 'standard' : 'basic',
    };
    
    setSelectedPlan(subscriptionPlan);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    // Navigate to business dashboard after successful payment
    navigate(`/business/${bizId}`);
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

  // Note: yearly savings are calculated inline in the UI

  const formatPrice = (plan: any) => {
    const price = billingPeriod === 'yearly' && plan.yearlyPrice 
      ? parseFloat(plan.yearlyPrice) 
      : parseFloat(plan.price);
    return price.toFixed(2);
  };

  const getPlanCardStyle = (plan: any) => {
    if (plan.popular) {
      return 'border-2 border-purple-300 shadow-xl relative overflow-hidden';
    }
    return 'border border-gray-200 shadow-sm';
  };

  if (!bizId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Business ID Required</h1>
          <p className="text-gray-600 mb-6">Please access this page through your business dashboard.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
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
          {/* Top bar with back button and language switcher */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate(`/business/${bizId}`)}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Business</span>
            </button>
            
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
                {t('pricing.title')}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('pricing.subtitle')}
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
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('pricing.monthly')}
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-3 rounded-lg font-medium transition-all relative ${
                  billingPeriod === 'yearly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('pricing.yearly')}
                <span className="absolute -top-2 -right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  {t('pricing.yearly.discount')}
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
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className={`bg-white rounded-2xl p-8 relative w-full max-w-sm ${getPlanCardStyle(plan)}`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-bl-lg rounded-tr-2xl text-sm font-medium">
                  {t('pricing.popular')}
                </div>
              )}

              <div className="text-center mb-6">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 mb-4">
                  {plan.popular ? (
                    <>
                      <StarIcon className="w-4 h-4 mr-1" />
                      <span>Popular</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheckIcon className="w-4 h-4 mr-1" />
                      <span>Standard</span>
                    </>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mt-4">{t(plan.name)}</h3>
                <div className="mt-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      €{formatPrice(plan)}
                    </span>
                    <span className="text-gray-500 ml-2">
                      / {billingPeriod === 'yearly' ? t('pricing.yearly.short') : t('pricing.monthly.short')}
                    </span>
                  </div>
                  {billingPeriod === 'yearly' && plan.yearlyPrice && (
                    <div className="mt-2 text-sm text-green-600 font-medium">
                      {t('pricing.save')} €{(parseFloat(plan.price) * 12 - parseFloat(plan.yearlyPrice)).toFixed(2)} {t('pricing.yearly.total')}
                    </div>
                  )}
                </div>
                <p className="text-gray-600 mt-4">{t(plan.description)}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature: string, featureIndex: number) => (
                  <li key={featureIndex} className="flex items-start">
                    <CheckIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{t(feature)}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <CreditCardIcon className="w-5 h-5 mr-2" />
                {t(plan.cta)}
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Comparison */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">{t('pricing.included.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">{t('pricing.included.ssl.title')}</h3>
              <p className="text-sm text-gray-600 text-center">{t('pricing.included.ssl.description')}</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">{t('pricing.included.backup.title')}</h3>
              <p className="text-sm text-gray-600 text-center">{t('pricing.included.backup.description')}</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ArrowRightIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">{t('pricing.included.updates.title')}</h3>
              <p className="text-sm text-gray-600 text-center">{t('pricing.included.updates.description')}</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <GlobeAltIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900">{t('pricing.included.support.title')}</h3>
              <p className="text-sm text-gray-600 text-center">{t('pricing.included.support.description')}</p>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('pricing.included.note')}
          </p>
        </div>

        {/* Skip option */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <button
            onClick={() => navigate(`/business/${bizId}`)}
            className="text-gray-600 hover:text-gray-800 font-medium underline"
          >
            Skip for now
          </button>
        </motion.div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          businessId={bizId || ''}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPlan(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default BusinessSubscriptionPlans;