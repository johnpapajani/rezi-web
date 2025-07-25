import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';
import { pricingPlans } from '../../data/content';

const Pricing: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);

  const handlePlanSelect = (planId: number) => {
    // For now, all plans redirect to signup
    navigate('/signup');
  };

  const handleFreeTrial = () => {
    navigate('/signup');
  };

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('pricing.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {t('pricing.subtitle')}
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-lg ${!isYearly ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
              {t('pricing.monthly')}
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isYearly ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg ${isYearly ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
              {t('pricing.yearly')}
            </span>
            {isYearly && (
              <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                {t('pricing.yearly.discount')}
              </span>
            )}
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <SparklesIcon className="w-4 h-4" />
                    <span>{t('pricing.popular')}</span>
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {t(plan.name)}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {t(plan.description)}
                  </p>
                  
                  {/* Price */}
                  <div className="mb-4">
                    {plan.price === '0' ? (
                      <div className="text-4xl font-bold text-gray-900">
                        {t('pricing.free.price')}
                      </div>
                    ) : (
                      <>
                        <div className="text-4xl font-bold text-gray-900">
                          €{isYearly && plan.yearlyPrice ? plan.yearlyPrice : plan.price}
                        </div>
                        <div className="text-gray-600">
                          / {isYearly ? t('pricing.monthly.short') : t('pricing.monthly.short')}
                        </div>
                        {isYearly && plan.yearlyPrice && (
                          <div className="text-sm text-gray-500 mt-1">
                            €{(parseFloat(plan.yearlyPrice) * 12).toFixed(2)} {t('pricing.yearly.total')}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{t(feature)}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`w-full py-3 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta === 'Kontaktoni' ? plan.cta : t(plan.cta)}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {t('pricing.included.title')}
            </h3>
            
                          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CheckIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="font-semibold text-gray-900 mb-1">{t('pricing.included.ssl.title')}</div>
                  <div className="text-sm text-gray-600">{t('pricing.included.ssl.description')}</div>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CheckIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="font-semibold text-gray-900 mb-1">{t('pricing.included.backup.title')}</div>
                  <div className="text-sm text-gray-600">{t('pricing.included.backup.description')}</div>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CheckIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="font-semibold text-gray-900 mb-1">{t('pricing.included.updates.title')}</div>
                  <div className="text-sm text-gray-600">{t('pricing.included.updates.description')}</div>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CheckIcon className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="font-semibold text-gray-900 mb-1">{t('pricing.included.support.title')}</div>
                  <div className="text-sm text-gray-600">{t('pricing.included.support.description')}</div>
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                {t('pricing.included.note')}
              </p>
            
            <button 
              onClick={handleFreeTrial}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              {t('pricing.cta.freeTrial')}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing; 