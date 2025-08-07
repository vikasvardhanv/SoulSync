import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Sparkles, Brain, ChevronRight, Users, Coffee, Star } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const WelcomePage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          alert(error.message || 'Login failed');
        } else {
          navigate('/dashboard');
        }
      } else {
        const { error } = await signUp(email, password, name);
        if (error) {
          alert(error.message || 'Signup failed');
        } else {
          alert('Account created successfully! Please check your email to verify your account.');
          navigate('/login');
        }
      }
    } catch (error: any) {
      alert('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Check for referral code in URL
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      setReferralCode(ref);
    }
  }, []);

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

        {/* Auth Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="friendly-card p-8"
        >
          <div className="flex mb-6 bg-warm-100 rounded-xl p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 rounded-lg transition-all font-medium ${
                isLogin 
                  ? 'bg-gradient-to-r from-coral-400 to-peach-400 text-white shadow-coral' 
                  : 'text-warm-600 hover:text-warm-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 rounded-lg transition-all font-medium ${
                !isLogin 
                  ? 'bg-gradient-to-r from-coral-400 to-peach-400 text-white shadow-coral' 
                  : 'text-warm-600 hover:text-warm-800'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="friendly-input w-full"
                  required
                />
              </div>
            )}
            
            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="friendly-input w-full"
                required
              />
            </div>
            
            {!isLogin && (
              <div>
                <input
                  type="text"
                  placeholder="Referral Code (Optional)"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className="friendly-input w-full"
                />
                {referralCode && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 flex items-center gap-2 text-mint-600 text-sm"
                  >
                    <Users className="w-4 h-4" />
                    <span>50% discount applied! 🎉</span>
                  </motion.div>
                )}
              </div>
            )}
            
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="friendly-input w-full"
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="friendly-button w-full flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="loading-dots">Processing</span>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Start Your Journey'}
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-warm-600 text-sm leading-relaxed">
              Ready to meet your perfect match?
              <br />
              <span className="text-coral-500 font-medium">Our AI makes the difference.</span>
            </p>
          </div>

          {/* Demo Mode */}
          <div className="mt-6 pt-6 border-t border-warm-200">
            <p className="text-warm-500 text-sm text-center mb-3">
              Want to try without signing up?
            </p>
            <Link
              to="/personality-quiz"
              className="block w-full text-center py-3 px-4 border-2 border-coral-200 rounded-xl text-coral-600 hover:bg-coral-50 hover:border-coral-300 transition-all font-medium"
            >
              Try Demo Mode
            </Link>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-6 text-xs text-warm-500"
        >
          <p>By continuing, you agree to our Terms & Privacy Policy</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomePage;