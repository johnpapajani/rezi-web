import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CreditCardIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useSubscription } from '../../hooks/useSubscription';
import { useTranslation } from '../../hooks/useTranslation';
import { SubscriptionPlan } from '../../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, plan, onSuccess }) => {
  const { t } = useTranslation();
  const { createSubscription, creating, error } = useSubscription({ autoFetch: false });
  const [paymentStep, setPaymentStep] = useState<'payment' | 'processing' | 'success' | 'error'>('payment');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleCardDataChange = (field: string, value: string) => {
    let formattedValue = value;
    
    // Format card number with spaces
    if (field === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) return; // Limit to 16 digits + 3 spaces
    }
    
    // Format expiry date as MM/YY
    if (field === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2, 4);
      }
      if (formattedValue.length > 5) return; // Limit to MM/YY
    }
    
    // Limit CVV to 3-4 digits
    if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 4) return;
    }

    setCardData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const validateCardData = () => {
    const errors = [];
    
    if (!cardData.cardholderName.trim()) {
      errors.push(t('payment.errors.cardholderNameRequired'));
    }
    
    if (!cardData.cardNumber.replace(/\s/g, '') || cardData.cardNumber.replace(/\s/g, '').length < 13) {
      errors.push(t('payment.errors.cardNumberInvalid'));
    }
    
    if (!cardData.expiryDate || cardData.expiryDate.length !== 5) {
      errors.push(t('payment.errors.expiryDateInvalid'));
    }
    
    if (!cardData.cvv || cardData.cvv.length < 3) {
      errors.push(t('payment.errors.cvvInvalid'));
    }

    return errors;
  };

  const handleSubmitPayment = async () => {
    setPaymentError(null);
    
    const validationErrors = validateCardData();
    if (validationErrors.length > 0) {
      setPaymentError(validationErrors.join(', '));
      return;
    }

    try {
      setPaymentStep('processing');
      
      // In a real implementation, you would:
      // 1. Create a Stripe payment method using the card data
      // 2. Pass the payment method ID to the subscription creation
      // For now, we'll simulate this with a mock payment method ID
      
      // Simulate Stripe payment method creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockPaymentMethodId = 'pm_mock_' + Date.now();
      
      await createSubscription({
        plan_id: plan.id,
        payment_method_id: mockPaymentMethodId,
      });
      
      setPaymentStep('success');
      
      // Auto-close and call success after a delay
      setTimeout(() => {
        onSuccess();
      }, 2000);
      
    } catch (err: any) {
      setPaymentStep('error');
      setPaymentError(err.detail || t('payment.errors.paymentFailed'));
    }
  };

  const renderPaymentForm = () => (
    <div className="space-y-6">
      {/* Plan Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">{t('payment.planSummary')}</h4>
        <div className="flex justify-between items-center">
          <span className="text-gray-700">{plan.name}</span>
          <span className="font-semibold text-gray-900">
            €{plan.price.toFixed(2)} / {plan.interval === 'month' ? t('common.month') : t('common.year')}
          </span>
        </div>
        {plan.trial_days && plan.trial_days > 0 && (
          <div className="mt-2 text-sm text-green-600">
            {t('payment.freeTrial')} {plan.trial_days} {t('common.days')}
          </div>
        )}
      </div>

      {/* Payment Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('payment.cardholderName')}
          </label>
          <input
            type="text"
            value={cardData.cardholderName}
            onChange={(e) => handleCardDataChange('cardholderName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={t('payment.cardholderNamePlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('payment.cardNumber')}
          </label>
          <input
            type="text"
            value={cardData.cardNumber}
            onChange={(e) => handleCardDataChange('cardNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="1234 5678 9012 3456"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('payment.expiryDate')}
            </label>
            <input
              type="text"
              value={cardData.expiryDate}
              onChange={(e) => handleCardDataChange('expiryDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="MM/YY"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('payment.cvv')}
            </label>
            <input
              type="text"
              value={cardData.cvv}
              onChange={(e) => handleCardDataChange('cvv', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="123"
            />
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <LockClosedIcon className="w-4 h-4" />
        <span>{t('payment.securityNotice')}</span>
      </div>

      {/* Error Display */}
      {(paymentError || error) && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5" />
          <span className="text-red-700 text-sm">{paymentError || error}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {t('common.cancel')}
        </button>
        <button
          type="button"
          onClick={handleSubmitPayment}
          disabled={creating}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          <CreditCardIcon className="w-4 h-4 mr-2" />
          {t('payment.subscribe')}
        </button>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{t('payment.processing.title')}</h3>
      <p className="text-gray-600">{t('payment.processing.subtitle')}</p>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-8">
      <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{t('payment.success.title')}</h3>
      <p className="text-gray-600">{t('payment.success.subtitle')}</p>
    </div>
  );

  const renderError = () => (
    <div className="text-center py-8">
      <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{t('payment.error.title')}</h3>
      <p className="text-gray-600 mb-4">{paymentError || error}</p>
      <button
        onClick={() => setPaymentStep('payment')}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        {t('payment.error.tryAgain')}
      </button>
    </div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={paymentStep === 'payment' ? onClose : undefined}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {paymentStep === 'payment' && t('payment.title')}
                {paymentStep === 'processing' && t('payment.processing.title')}
                {paymentStep === 'success' && t('payment.success.title')}
                {paymentStep === 'error' && t('payment.error.title')}
              </h2>
              {paymentStep === 'payment' && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Content */}
            {paymentStep === 'payment' && renderPaymentForm()}
            {paymentStep === 'processing' && renderProcessing()}
            {paymentStep === 'success' && renderSuccess()}
            {paymentStep === 'error' && renderError()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentModal; 