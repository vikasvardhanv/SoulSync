// frontend/src/components/ResetPassword.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword, loading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validToken, setValidToken] = useState(true);
  const [resetSuccess, setResetSuccess] = useState(false);

  const token = searchParams.get('token');
  const userId = searchParams.get('id');

  useEffect(() => {
    if (!token || !userId) {
      setValidToken(false);
    }
  }, [token, userId]);

  const validatePasswords = () => {
    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validatePasswords()) {
      return;
    }

    try {
      await resetPassword(token!, userId!, formData.newPassword);
      setResetSuccess(true);
      toast.success('Password reset successfully!');
      
      // Redirect to login after success
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearError();
  };

  if (!validToken) {
    return (
      <div className="min-h-screen warm-gradient flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="friendly-card p-8 max-w-md w-full text-center"
        >
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-warm-800 mb-2">Invalid Reset Link</h1>
          <p className="text-warm-600 mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/forgot-password')}
            className="friendly-button w-full"
          >
            Request New Reset Link
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="min-h-screen warm-gradient flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="friendly-card p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-2xl font-bold text-warm-800 mb-2">Password Reset Successfully!</h1>
          <p className="text-warm-600 mb-4">
            Your password has been updated. You can now log in with your new password.
          </p>
          <p className="text-sm text-warm-500 mb-6">
            Redirecting to login page in 3 seconds...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <motion.div 
              className="bg-coral-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3 }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login')}
            className="friendly-button w-full"
          >
            Go to Login Now
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen warm-gradient flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="friendly-card p-8"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-coral-400 to-peach-400 rounded-full mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-friendly font-bold text-warm-800 mb-2">Reset Your Password</h1>
            <p className="text-warm-600">
              Enter your new password below. Make sure it's strong and secure.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3"
              >
                <p className="text-red-600 text-sm">{error}</p>
              </motion.div>
            )}

            {/* New Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-warm-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="friendly-input w-full pl-10 pr-12 pt-6 pb-2 bg-transparent"
                required
                disabled={loading}
              />
              <label
                className={`absolute left-10 transition-all duration-200 pointer-events-none
                  ${formData.newPassword ? 'text-warm-700 text-xs top-1' : 'text-warm-400 top-1/2 transform -translate-y-1/2'}
                `}
              >
                New Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-warm-400 hover:text-warm-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-warm-400 pointer-events-none" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="friendly-input w-full pl-10 pr-12 pt-6 pb-2 bg-transparent"
                required
                disabled={loading}
              />
              <label
                className={`absolute left-10 transition-all duration-200 pointer-events-none
                  ${formData.confirmPassword ? 'text-warm-700 text-xs top-1' : 'text-warm-400 top-1/2 transform -translate-y-1/2'}
                `}
              >
                Confirm New Password
              </label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-warm-400 hover:text-warm-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password requirements */}
            <div className="bg-peach-50 border border-peach-200 rounded-lg p-4">
              <p className="text-sm text-warm-600 font-medium mb-2">Password requirements:</p>
              <ul className="text-xs text-warm-600 space-y-1">
                <li className={`flex items-center gap-2 ${formData.newPassword.length >= 6 ? 'text-green-600' : ''}`}>
                  <div className={`w-2 h-2 rounded-full ${formData.newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  At least 6 characters long
                </li>
                <li className={`flex items-center gap-2 ${formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword ? 'text-green-600' : ''}`}>
                  <div className={`w-2 h-2 rounded-full ${formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  Passwords match
                </li>
              </ul>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !formData.newPassword || !formData.confirmPassword}
              className="friendly-button w-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="loading-dots">Updating Password</span>
              ) : (
                'Update Password'
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-warm-600 text-sm">
              Remember your password?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-coral-500 hover:text-coral-600 font-medium transition-colors"
              >
                Back to Login
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;