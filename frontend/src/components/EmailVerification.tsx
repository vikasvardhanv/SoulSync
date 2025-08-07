// frontend/src/components/EmailVerification.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader, Mail } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, resendVerification, loading, error } = useAuthStore();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      handleVerification(token);
    } else {
      setVerificationStatus('error');
    }
  }, [searchParams]);

  const handleVerification = async (token: string) => {
    try {
      await verifyEmail(token);
      setVerificationStatus('success');
      toast.success('Email verified successfully!');
      
      // Redirect after success
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Verification error:', error);
      if (error.response?.data?.action?.type === 'resend_verification') {
        setVerificationStatus('expired');
      } else {
        setVerificationStatus('error');
      }
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerification();
      toast.success('New verification email sent!');
    } catch (error) {
      toast.error('Failed to send verification email');
    }
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case 'loading':
        return (
          <div className="text-center">
            <Loader className="w-16 h-16 text-coral-500 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-warm-800 mb-2">Verifying Your Email</h1>
            <p className="text-warm-600">Please wait while we verify your email address...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            </motion.div>
            <h1 className="text-2xl font-bold text-warm-800 mb-2">Email Verified Successfully!</h1>
            <p className="text-warm-600 mb-4">
              Your account is now fully activated. Redirecting you to your dashboard...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div 
                className="bg-coral-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2 }}
              />
            </div>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center">
            <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-warm-800 mb-2">Verification Link Expired</h1>
            <p className="text-warm-600 mb-6">
              Your verification link has expired. Would you like us to send you a new one?
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleResendVerification}
              disabled={loading}
              className="friendly-button"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin mr-2" /> : <Mail className="w-5 h-5 mr-2" />}
              Send New Verification Email
            </motion.button>
          </div>
        );

      case 'error':
      default:
        return (
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-warm-800 mb-2">Verification Failed</h1>
            <p className="text-warm-600 mb-6">
              {error || 'The verification link is invalid or has expired.'}
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/login')}
              className="friendly-button mr-4"
            >
              Back to Login
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleResendVerification}
              disabled={loading}
              className="friendly-button-secondary"
            >
              Resend Verification
            </motion.button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen warm-gradient flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="friendly-card p-8 max-w-md w-full"
      >
        {renderContent()}
      </motion.div>
    </div>
  );
};

export default EmailVerification;