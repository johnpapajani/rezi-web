import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
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

// Initialize Stripe with your public key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_51R6O3ELcZ6WdFWSfSDs0ZlBp9xT9jm946Tfo1vmeApqbGIBL1Z1Eoyppde6lKf53dG9CqzMAD8KYIZtKlvG3ajcj00QJkUCZar');

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan;
  onSuccess: () => void;
}

// Payment Form Component (inside Elements provider)
const PaymentForm: React.FC<{
  plan: SubscriptionPlan;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ plan, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const { createSubscription } = useSubscription();
  const stripe = useStripe();
  const elements = useElements();

  // Initialize all state first - before any conditional logic
  const [cardholderName, setCardholderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardError, setCardError] = useState('');
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardholderName.trim()) {
      setError(t('payment.errors.cardholderNameRequired') || 'Cardholder name is required');
      return;
    }

    setLoading(true);
    setError('');
    setCardError('');

    try {
      let paymentMethodId = null;

      if (!stripe || !elements) {
        // Stripe.js has not loaded yet. Make sure to disable form submission.
        setError('Stripe has not loaded yet. Please refresh and try again.');
        setLoading(false);
        return;
      }

      // Get card element
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        setError('Card form is not ready. Please refresh the page and try again.');
        setLoading(false);
        return;
      }

      // Create payment method
      const { error: stripeError, paymentMethod: stripePaymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardholderName.trim(),
        },
      });

      if (stripeError) {
        console.error('Stripe error:', stripeError);
        setCardError(stripeError.message || 'Payment processing error');
        setLoading(false);
        return;
      }

      paymentMethodId = stripePaymentMethod?.id;

      if (!paymentMethodId) {
        setError('Failed to create payment method');
        setLoading(false);
        return;
      }

      // Create subscription with payment method
      await createSubscription({
        plan_id: plan.id,
        payment_method_id: paymentMethodId,
      });

      setSubscriptionSuccess(true);

      // Auto-close and call success after a delay
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (err: any) {
      console.error('Error creating subscription:', err);
      setError(err.message || err.detail || 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  // Show success message if subscription was created successfully
  if (subscriptionSuccess) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircleIcon className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('payment.success.title') || 'Payment Successful!'}
        </h3>
        <p className="text-gray-600">
          {t('payment.success.subtitle') || 'Your subscription has been activated.'}
        </p>
      </div>
    );
  }

  // Main payment form
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          {t('payment.title') || 'Payment Details'}
        </h3>
        <button
          onClick={onClose}
          disabled={loading}
          className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Plan Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-2">
          {t('payment.planSummary') || 'Plan Summary'}
        </h4>
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">{plan.name}</span>
          <span className="text-lg font-bold text-blue-600">
            €{plan.price.toFixed(2)}/{plan.interval === 'month' ? 'month' : 'year'}
          </span>
        </div>
        {plan.trial_days && plan.trial_days > 0 && (
          <p className="text-sm text-green-600 mt-1">
            {plan.trial_days} day free trial
          </p>
        )}
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('payment.cardholderName') || 'Cardholder Name'} *
          </label>
          <input
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            required
            disabled={loading}
            placeholder={t('payment.cardholderNamePlaceholder') || 'Enter cardholder name'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        {/* Card Element */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('payment.cardNumber') || 'Card Information'}
          </label>
          <div className="w-full px-3 py-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <CardElement 
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#374151',
                    '::placeholder': {
                      color: '#9CA3AF',
                    },
                  },
                  invalid: {
                    color: '#EF4444',
                  },
                },
              }}
              onChange={(event) => {
                if (event.error) {
                  setCardError(event.error.message);
                } else {
                  setCardError('');
                }
              }}
            />
          </div>
          {cardError && <div className="mt-2 text-red-600 text-sm">{cardError}</div>}
        </div>

        {/* Security Notice */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <LockClosedIcon className="w-4 h-4" />
          <span>{t('payment.securityNotice') || 'Your payment information is secure and encrypted'}</span>
        </div>

        {/* Submit Button */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t('common.cancel') || 'Cancel'}
          </button>
          <button
            type="submit"
            disabled={loading || !stripe}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            <CreditCardIcon className="w-5 h-5" />
            <span>
              {loading 
                ? (t('payment.processing.title') || 'Processing...')
                : !stripe 
                ? 'Loading Stripe...'
                : (t('payment.subscribe') || `Subscribe - €${plan.price.toFixed(2)}`)
              }
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

// Main Modal Component wrapped with Stripe Elements
const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, plan, onSuccess }) => {
  return (
    <Elements stripe={stripePromise}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              // Only allow closing by clicking backdrop
              const target = e.target as HTMLElement;
              if (target === e.currentTarget) {
                onClose();
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <PaymentForm 
                plan={plan} 
                onClose={onClose} 
                onSuccess={onSuccess}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Elements>
  );
};

export default PaymentModal; 