import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, Check, Star, Zap, Heart, CreditCard, TestTube, Bitcoin, Coins } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useApp } from '../context/AppContext';
import { paymentsAPI } from '../services/api';
import NOWPaymentsButton from './NOWPaymentsButton';

const PaymentModal = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'paypal' | 'nowpayments' | 'demo'>('crypto');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed'>('pending');
  const navigate = useNavigate();
  const { dispatch } = useApp();

  // PayPal configuration
  const paypalOptions = {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "AZDxjDScFpQtjWTOUtWKbyN_bDt4OgqaF4eYXlewfBP4-8aqX3PiV8e1GWU6liB2CUXlkA59kJXE7M6R",
    currency: "USD",
    intent: "capture"
  };

  // Create crypto payment
  const createCryptoPayment = async () => {
    try {
      setIsProcessing(true);
      setPaymentError('');
      
      const response = await paymentsAPI.createPayment({
        amount: 10.00,
        currency: 'USD',
        description: 'SoulSync AI Matchmaking - Limited Launch Offer'
      });

      const { payment } = response.data.data;
      setPaymentId(payment.id);

      // Open Coinbase Commerce payment page
      if (payment.hostedUrl) {
        window.open(payment.hostedUrl, '_blank');
      }

      // Start polling for payment status
      pollPaymentStatus(payment.id);
      
    } catch (error) {
      console.error('Crypto payment creation error:', error);
      setPaymentError('Failed to create payment. Please try again.');
      setIsProcessing(false);
    }
  };

  // Poll payment status
  const pollPaymentStatus = async (id: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await paymentsAPI.getPaymentStatus(id);
        const { payment } = response.data.data;
        
        if (payment.status === 'completed') {
          setPaymentStatus('completed');
          setPaymentSuccess(true);
          dispatch({ type: 'SET_PAYMENT_STATUS', payload: true });
          clearInterval(pollInterval);
          
          setTimeout(() => {
            navigate('/compatibility-quiz');
          }, 2000);
        } else if (payment.status === 'failed') {
          setPaymentStatus('failed');
          setPaymentError('Payment failed. Please try again.');
          setIsProcessing(false);
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Payment status check error:', error);
      }
    }, 5000); // Poll every 5 seconds

    // Stop polling after 10 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (paymentStatus === 'pending') {
        setPaymentError('Payment timeout. Please try again.');
        setIsProcessing(false);
      }
    }, 600000);
  };

  // PayPal payment handlers
  const createOrder = (data: any, actions: any) => {
    setIsProcessing(true);
    setPaymentError('');
    
    return actions.order.create({
      purchase_units: [{
        amount: {
          value: "10.00",
          currency_code: "USD"
        },
        description: "SoulSync AI Matchmaking - Limited Launch Offer"
      }],
      application_context: {
        brand_name: "SoulSync",
        user_action: "PAY_NOW"
      }
    });
  };

  const onApprove = async (data: any, actions: any) => {
    try {
      const details = await actions.order.capture();
      
      // Create subscription via backend
      await paymentsAPI.createPayment({
        amount: 10.00,
        currency: 'USD',
        description: 'SoulSync AI Matchmaking - Limited Launch Offer',
        provider: 'paypal',
        providerId: details.id
      });
      
      console.log('PayPal payment completed:', details);
      
      setPaymentSuccess(true);
      dispatch({ type: 'SET_PAYMENT_STATUS', payload: true });
      
      setTimeout(() => {
        navigate('/compatibility-quiz');
      }, 2000);
      
    } catch (error) {
      console.error('PayPal payment error:', error);
      setPaymentError('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const onError = (error: any) => {
    console.error('PayPal error:', error);
    setPaymentError('Payment failed. Please try again.');
    setIsProcessing(false);
  };

  const onCancel = () => {
    setIsProcessing(false);
    setPaymentError('Payment was cancelled.');
  };

  const handleDemoPayment = () => {
    setIsProcessing(true);
    setPaymentError('');
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentSuccess(true);
      dispatch({ type: 'SET_PAYMENT_STATUS', payload: true });
      
      setTimeout(() => {
        navigate('/compatibility-quiz');
      }, 2000);
    }, 2000);
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-6"
          >
            <Check className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-3xl font-bold text-white mb-4">
            Payment Successful! 🎉
          </h1>

          <p className="text-gray-300 text-lg mb-6">
            Welcome to SoulSync! Let's find your perfect match.
          </p>

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block w-8 h-8 border-2 border-pink-400 border-t-transparent rounded-full"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-4"
            >
              <Lock className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-3xl font-bold text-white mb-2">
              Limited Launch Offer
            </h1>
            
            <p className="text-gray-300 mb-4">
              Unlock SoulSync AI Matchmaking & Premium Chat
            </p>
            
            <div className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 border border-pink-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
                <span className="text-2xl font-bold text-white">$10</span>
                <span className="text-gray-400 line-through">$29</span>
              </div>
              <p className="text-sm text-gray-300">
                We're invite-only. Your payment ensures real users & accurate matching.
              </p>
            </div>
          </div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              What You Get:
            </h3>
            
            <div className="space-y-3">
              {[
                'AI-Powered Compatibility Matching',
                'Unlimited Premium Chat Features',
                'Advanced Personality Analysis',
                'Smart Date Location Finder',
                'Priority Match Recommendations'
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Payment Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6"
          >
            {/* Payment Method Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </h3>
              
              <div className="grid grid-cols-4 gap-3 mb-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPaymentMethod('crypto')}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                    paymentMethod === 'crypto'
                      ? 'border-orange-500 bg-orange-500/20 text-white'
                      : 'border-white/20 bg-white/5 text-gray-300 hover:border-orange-400'
                  }`}
                >
                  <Bitcoin className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">Crypto</div>
                  <div className="text-xs opacity-75">Recommended</div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                    paymentMethod === 'paypal'
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-white/20 bg-white/5 text-gray-300 hover:border-blue-400'
                  }`}
                >
                  <CreditCard className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">PayPal</div>
                  <div className="text-xs opacity-75">Fallback</div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPaymentMethod('nowpayments')}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                    paymentMethod === 'nowpayments'
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-white/20 bg-white/5 text-gray-300 hover:border-blue-400'
                  }`}
                >
                  <Coins className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">NOW</div>
                  <div className="text-xs opacity-75">Payments</div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPaymentMethod('demo')}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                    paymentMethod === 'demo'
                      ? 'border-green-500 bg-green-500/20 text-white'
                      : 'border-white/20 bg-white/5 text-gray-300 hover:border-green-400'
                  }`}
                >
                  <TestTube className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">Demo</div>
                  <div className="text-xs opacity-75">Testing</div>
                </motion.button>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">
                Secure Payment
              </h3>
              <p className="text-sm text-gray-400">
                {paymentMethod === 'crypto' 
                  ? 'Pay securely with Bitcoin, Ethereum, or other cryptocurrencies'
                  : paymentMethod === 'paypal'
                  ? 'Pay securely with PayPal or credit card'
                  : 'Demo payment for testing purposes'
                }
              </p>
            </div>

            {paymentError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4"
              >
                <p className="text-red-400 text-sm">{paymentError}</p>
              </motion.div>
            )}

            {/* Crypto Payment Status */}
            {paymentMethod === 'crypto' && paymentId && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 mb-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 text-sm font-medium">Crypto Payment</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Payment page opened in new tab. Please complete payment there.
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Status: {paymentStatus === 'pending' ? 'Waiting for payment...' : paymentStatus}
                </p>
              </motion.div>
            )}

            {paymentMethod === 'crypto' ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={createCryptoPayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Bitcoin className="w-5 h-5" />
                {isProcessing ? 'Creating Payment...' : 'Pay with Crypto ($10)'}
              </motion.button>
            ) : paymentMethod === 'paypal' ? (
              <div className="paypal-button-container">
                <PayPalButtons
                  style={{
                    layout: "vertical",
                    color: "gold",
                    shape: "rect",
                    label: "paypal",
                    height: 45
                  }}
                  createOrder={createOrder}
                  onApprove={onApprove}
                  onError={onError}
                  onCancel={onCancel}
                  disabled={isProcessing}
                />
              </div>
            ) : paymentMethod === 'nowpayments' ? (
              <NOWPaymentsButton
                amount={10.00}
                currency="USD"
                description="SoulSync AI Matchmaking - Limited Launch Offer"
                onSuccess={() => {
                  setPaymentSuccess(true);
                  dispatch({ type: 'SET_PAYMENT_STATUS', payload: true });
                  setTimeout(() => {
                    navigate('/compatibility-quiz');
                  }, 2000);
                }}
                onError={(error) => {
                  setPaymentError(error);
                  setIsProcessing(false);
                }}
                onPending={() => {
                  setIsProcessing(true);
                  setPaymentError('');
                }}
              />
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDemoPayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <TestTube className="w-5 h-5" />
                {isProcessing ? 'Processing Demo Payment...' : 'Complete Demo Payment ($10)'}
              </motion.button>
            )}

            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block w-5 h-5 border-2 border-pink-400 border-t-transparent rounded-full mr-2"
                />
                <span className="text-gray-300">
                  {paymentMethod === 'crypto' ? 'Creating crypto payment...' : 'Processing payment...'}
                </span>
              </motion.div>
            )}

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" />
                {paymentMethod === 'crypto' 
                  ? 'Secured by Coinbase Commerce & blockchain technology'
                  : paymentMethod === 'paypal'
                  ? 'Secured by PayPal & 256-bit SSL encryption'
                  : 'Demo mode - No real payment processed'
                }
              </p>
            </div>
          </motion.div>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              ← Back to quiz
            </button>
          </div>
        </motion.div>
      </div>
    </PayPalScriptProvider>
  );
};

export default PaymentModal;