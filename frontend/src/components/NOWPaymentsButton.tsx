import React from 'react';
import { Coins } from 'lucide-react';
import { paymentsAPI } from '../services/api';

interface NOWPaymentsButtonProps {
  amount: number;
  currency: string;
  description: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  onPending: () => void;
}

const NOWPaymentsButton: React.FC<NOWPaymentsButtonProps> = ({
  amount,
  currency,
  description,
  onSuccess,
  onError,
  onPending
}) => {
  const handleNOWPayments = async () => {
    try {
      // In a real implementation, you would integrate with NOWPayments API
      // For demo purposes, we'll simulate the payment flow
      onPending();
      
      // API call to backend to create NOWPayments payment
      const response = await paymentsAPI.createNOWPayments({
        amount,
        currency,
        description
      });
      
      const data = response.data;
      
      if (data.success) {
        // Open NOWPayments payment page
        if (data.data.payment.hostedUrl) {
          window.open(data.data.payment.hostedUrl, '_blank');
          
          // Poll for payment status (in a real implementation, you would use NOWPayments IPN)
          pollPaymentStatus(data.data.payment.id);
        }
      } else {
        onError(data.message || 'Failed to create payment');
      }
    } catch (error) {
      onError('Failed to initiate payment');
    }
  };
  
  const pollPaymentStatus = async (paymentId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await paymentsAPI.getPaymentStatus(paymentId);
        const data = response.data;
        
        if (data.success && data.data.payment.status === 'completed') {
          clearInterval(pollInterval);
          onSuccess();
        } else if (data.success && data.data.payment.status === 'failed') {
          clearInterval(pollInterval);
          onError('Payment failed');
        }
        // Continue polling if status is pending
      } catch (error) {
        console.error('Payment status check error:', error);
      }
    }, 5000); // Poll every 5 seconds
    
    // Stop polling after 15 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      onError('Payment timeout');
    }, 900000);
  };
  
  return (
    <button
      onClick={handleNOWPayments}
      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
    >
      <Coins className="w-5 h-5" />
      Pay with NOWPayments (${amount})
    </button>
  );
};

export default NOWPaymentsButton;
