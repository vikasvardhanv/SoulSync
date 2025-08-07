// frontend/src/components/ForgotPassword.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const { forgotPassword, loading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      await forgotPassword(email);
      setEmailSent(true);
      toast.success('Password reset email sent!');
    } catch (error) {
      // Error is handled by the store
    }
  };

  if (emailSent) {
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
         <h1 className="text-2xl font-bold text-warm-800 mb-4">Check Your Email</h1>
         <p className="text-warm-600 mb-6">
           We've sent a password reset link to <strong>{email}</strong>. 
           Please check your email and follow the instructions to reset your password.
         </p>
         
         <div className="bg-peach-50 border border-peach-200 rounded-lg p-4 mb-6">
           <p className="text-sm text-warm-600">
             <strong>Didn't receive the email?</strong> Check your spam folder or 
             <button 
               onClick={() => setEmailSent(false)}
               className="text-coral-500 hover:text-coral-600 ml-1 underline"
             >
               try again
             </button>
           </p>
         </div>

         <div className="space-y-3">
           <Link
             to="/login"
             className="block w-full friendly-button text-center"
           >
             Back to Login
           </Link>
           
           <button
             onClick={() => setEmailSent(false)}
             className="block w-full friendly-button-secondary text-center"
           >
             Try Different Email
           </button>
         </div>
       </motion.div>
     </div>
   );
 }

 return (
   <div className="min-h-screen warm-gradient flex items-center justify-center p-4">
     {/* Decorative elements */}
     <div className="absolute inset-0 overflow-hidden pointer-events-none">
       <div className="absolute top-20 left-10 w-32 h-32 bg-coral-200 rounded-full opacity-20 animate-bounce-gentle"></div>
       <div className="absolute bottom-20 right-10 w-24 h-24 bg-mint-200 rounded-full opacity-30 animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
     </div>

     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       className="w-full max-w-md relative z-10"
     >
       {/* Back to login */}
       <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         className="mb-6"
       >
         <Link
           to="/login"
           className="inline-flex items-center gap-2 text-warm-600 hover:text-warm-800 transition-colors"
         >
           <ArrowLeft className="w-4 h-4" />
           <span className="text-sm font-medium">Back to login</span>
         </Link>
       </motion.div>

       {/* Main form */}
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.1 }}
         className="friendly-card p-8"
       >
         <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-coral-400 to-peach-400 rounded-full mb-4">
             <Mail className="w-8 h-8 text-white" />
           </div>
           <h1 className="text-3xl font-friendly font-bold text-warm-800 mb-2">Forgot Password?</h1>
           <p className="text-warm-600">
             No worries! Enter your email address and we'll send you a link to reset your password.
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

           <div className="relative">
             <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-warm-400 pointer-events-none" />
             <input
               type="email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               className="friendly-input w-full pl-10 pt-6 pb-2 bg-transparent"
               required
               disabled={loading}
             />
             <label
               className={`absolute left-10 transition-all duration-200 pointer-events-none
                 ${email ? 'text-warm-700 text-xs top-1' : 'text-warm-400 top-1/2 transform -translate-y-1/2'}
               `}
             >
               Email Address
             </label>
           </div>

           <motion.button
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             type="submit"
             disabled={loading || !email.trim()}
             className="friendly-button w-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {loading ? (
               <span className="loading-dots">Sending Reset Link</span>
             ) : (
               'Send Reset Link'
             )}
           </motion.button>
         </form>

         <div className="mt-6 text-center">
           <p className="text-warm-600 text-sm">
             Remember your password?{' '}
             <Link
               to="/login"
               className="text-coral-500 hover:text-coral-600 font-medium transition-colors"
             >
               Sign in
             </Link>
           </p>
         </div>
       </motion.div>
     </motion.div>
   </div>
 );
};

export default ForgotPassword;