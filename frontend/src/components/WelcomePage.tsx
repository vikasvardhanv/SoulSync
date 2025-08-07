// frontend/src/components/WelcomePage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Sparkles, Brain, ChevronRight, Users, Coffee, Star } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const WelcomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen warm-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-coral-200 rounded-full opacity-20 animate-bounce-gentle"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-mint-200 rounded-full opacity-30 animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-peach-200 rounded-full opacity-25 animate-bounce-gentle" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-lavender-200 rounded-full opacity-20 animate-bounce-gentle" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-coral-400 to-peach-400 rounded-full mb-6 shadow-coral"
          >
            <Heart className="w-12 h-12 text-white" fill="currentColor" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-5xl font-friendly font-bold bg-gradient-to-r from-coral-500 to-peach-500 bg-clip-text text-transparent mb-3"
          >
            SoulSync
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-warm-700 text-xl font-medium mb-2"
          >
            Where Hearts Align with AI
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-2 text-warm-600 text-sm"
          >
            <Brain className="w-4 h-4 text-mint-500" />
            <span>Powered by Emotion. Perfected by AI.</span>
            <Sparkles className="w-4 h-4 text-gold-400" />
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center justify-center gap-4 mt-4 text-xs text-warm-500"
          >
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-gold-400 fill-current" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-sky-400" />
              <span>10K+ Matches</span>
            </div>
            <div className="flex items-center gap-1">
              <Coffee className="w-3 h-3 text-sage-500" />
              <span>Human Touch</span>
            </div>
          </motion.div>
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="friendly-card p-8 space-y-4"
        >
          <Link to="/signup">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="friendly-button w-full flex items-center justify-center gap-2 font-semibold"
            >
              Start Your Journey
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </Link>
          
          <div className="text-center">
            <span className="text-warm-600">Already have an account? </span>
            <Link
              to="/login"
              className="text-coral-500 hover:text-coral-600 font-medium transition-colors"
            >
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="text-center mt-6 text-xs text-warm-500"
        >
          <p>By continuing, you agree to our Terms & Privacy Policy</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomePage;