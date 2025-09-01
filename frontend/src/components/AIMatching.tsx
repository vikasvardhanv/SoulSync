import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, Heart, Zap, Users, AlertCircle, LogOut, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usersAPI } from '../services/api';
import { useAuthStore } from '../stores/authStore';

// Define the user type based on backend response
interface User {
  id: string;
  name: string;
  age?: number;
  bio?: string;
  location?: string;
  interests?: string[];
  photos?: string[];
  createdAt: string;
  answers?: Record<string, unknown>;
}

const AIMatching = () => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { dispatch, state } = useApp();
  const { user, signOut } = useAuthStore();

  const steps = useMemo(() => [
    { icon: Brain, text: "Analyzing your personality profile...", duration: 3000 },
    { icon: Heart, text: "Processing emotional compatibility vectors...", duration: 4000 },
    { icon: Users, text: "Scanning potential matches...", duration: 5000 },
    { icon: Zap, text: "Calculating relationship chemistry...", duration: 3000 }
  ], []);

  // Fetch potential matches from backend
  const fetchPotentialMatches = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check daily match limit based on subscription status
      const matchLimit = state.hasPremium ? 10 : 2;
      
      if (state.dailyMatchCount >= matchLimit) {
        setError(`Daily match limit reached! ${state.hasPremium ? 'Premium users can match with 10 people per day.' : 'Free users can only match with 2 people per day.'} Please try again tomorrow.`);
        return null;
      }
      
      const response: { data: { data: { matches: User[] } } } = await usersAPI.getPotentialMatches({
        limit: 20,
        offset: 0
      });

      const { matches } = response.data.data;
      
      if (matches.length === 0) {
        setError('No potential matches found. Please try again later.');
        return null;
      }

      return matches;
    } catch (error) {
      console.error('Error fetching potential matches:', error);
      setError('Failed to fetch potential matches. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [state.hasPremium, state.dailyMatchCount]);

  // Calculate compatibility score (simplified version)
  const calculateCompatibilityScore = useCallback(() => {
    // This is a simplified compatibility calculation
    // In production, this would be done by AI/ML on the backend
    let score = 7.0; // Base score
    
    // Add some randomness for demo purposes
    score += Math.random() * 3;
    
    // Ensure score is between 7.0 and 10.0
    return Math.min(10.0, Math.max(7.0, score));
  }, []);

  // Type for user with compatibility score
  interface UserWithScore {
    id: string;
    name: string;
    age: number;
    bio: string;
    interests: string[];
    photos?: string[];
    answers?: Record<string, unknown>;
    compatibility: number;
    photo: string;
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  useEffect(() => {
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
    let currentTime = 0;

    const timer = setInterval(() => {
      currentTime += 100;
      const newProgress = (currentTime / totalDuration) * 100;
      setProgress(newProgress);

      // Update current step
      let stepTime = 0;
      for (let i = 0; i < steps.length; i++) {
        stepTime += steps[i].duration;
        if (currentTime <= stepTime) {
          setCurrentStep(i);
          break;
        }
      }

      if (currentTime >= totalDuration) {
        clearInterval(timer);
        
        // Find a match using real data
        setTimeout(async () => {
          try {
            const potentialMatches = await fetchPotentialMatches();
            
            if (!potentialMatches) {
              // If no matches found, show error and allow retry
              return;
            }

            const rejectedIds = state.rejectedMatches.map(m => m.id);
            
            const availableUsers = potentialMatches.filter((user: User) => !rejectedIds.includes(user.id));
            
            if (availableUsers.length === 0) {
              // Reset if no users available
              dispatch({ type: 'RESET_DAILY_MATCHES' });
              const resetUsers = potentialMatches;
              const matchesWithScores: UserWithScore[] = resetUsers.map((user: User) => ({
                ...user,
                age: user.age || 25, // Default age if not provided
                bio: user.bio || 'No bio available', // Default bio if not provided
                interests: user.interests || [], // Default to empty array if not provided
                photo: user.photos?.[0] || '/default-avatar.png', // Use first photo or default
                compatibility: Math.round(calculateCompatibilityScore() * 10) / 10
              }));
              
              // Sort by compatibility score
              matchesWithScores.sort((a, b) => b.compatibility - a.compatibility);
              
              // Select top match
              const topMatch = matchesWithScores[0];
              
              if (topMatch) {
                dispatch({ type: 'SET_MATCH', payload: topMatch });
                navigate('/match-reveal');
              } else {
                setError('No compatible matches found. Please try again later.');
              }
            } else {
              const matchesWithScores: UserWithScore[] = availableUsers.map((user: User) => ({
                ...user,
                age: user.age || 25, // Default age if not provided
                bio: user.bio || 'No bio available', // Default bio if not provided
                interests: user.interests || [], // Default to empty array if not provided
                photo: user.photos?.[0] || '/default-avatar.png', // Use first photo or default
                compatibility: Math.round(calculateCompatibilityScore() * 10) / 10
              }));

              // Sort by compatibility score
              matchesWithScores.sort((a, b) => b.compatibility - a.compatibility);
              
              // Select top match
              const topMatch = matchesWithScores[0];
              
              if (topMatch) {
                dispatch({ type: 'SET_MATCH', payload: topMatch });
                navigate('/match-reveal');
              } else {
                setError('No compatible matches found. Please try again later.');
              }
            }
          } catch (error) {
            console.error('Error in matching process:', error);
            setError('Failed to find matches. Please try again.');
          }
        }, 1000);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [steps, fetchPotentialMatches, state.rejectedMatches, state.compatibilityAnswers, dispatch, navigate, calculateCompatibilityScore]);

  // Retry function
  const handleRetry = () => {
    setError(null);
    setProgress(0);
    setCurrentStep(0);
    // Restart the matching process
    window.location.reload();
  };

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen warm-gradient flex items-center justify-center p-4 relative">
        {/* Header with user info and logout */}
        <div className="absolute top-4 right-4 flex items-center gap-4">
          <div className="flex items-center gap-2 text-warm-800">
            <div className="w-8 h-8 bg-gradient-to-r from-coral-400 to-peach-400 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium">{user?.name || 'User'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-warm-700 hover:text-warm-900 hover:bg-white/30 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-coral-400 to-peach-400 rounded-full mb-6 shadow-coral"
          >
            <AlertCircle className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-3xl font-bold text-warm-800 mb-4">
            Oops! 😅
          </h1>

          <p className="text-warm-600 text-lg mb-6">
            {error}
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRetry}
            className="friendly-button font-semibold px-8 py-3"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen warm-gradient flex items-center justify-center p-4 relative">
      {/* Header with user info and logout */}
      <div className="absolute top-4 right-4 flex items-center gap-4">
        <div className="flex items-center gap-2 text-warm-800">
          <div className="w-8 h-8 bg-gradient-to-r from-coral-400 to-peach-400 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium">{user?.name || 'User'}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-warm-700 hover:text-warm-900 hover:bg-white/30 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        {/* Animated Logo */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 4, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-coral-400 via-peach-400 to-mint-400 rounded-full mb-8 relative shadow-coral"
        >
          <Heart className="w-12 h-12 text-white" fill="currentColor" />
          
          {/* Orbital particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              animate={{
                rotate: [0, 360],
                x: [20, -20, 20],
                y: [20, -20, 20],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.5
              }}
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${i * 60}deg) translateX(40px)`
              }}
            />
          ))}
        </motion.div>

        {/* Main Text */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-friendly font-bold text-warm-800 mb-4"
        >
          SoulSyncing You Now...
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-warm-600 text-lg mb-8 max-w-sm mx-auto"
        >
          Your answers are being analyzed by our AI compatibility engine. We're finding someone who gets you. 💫
        </motion.p>

        {/* Progress Steps */}
        <div className="space-y-6 mb-8">
          {steps.map((Step, index) => {
            const StepIcon = Step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: isActive || isCompleted ? 1 : 0.6,
                  x: 0,
                  scale: isActive ? 1.05 : 1
                }}
                transition={{ delay: index * 0.2 }}
                className={`friendly-card p-4 ${
                  isActive 
                    ? 'border-coral-300 bg-coral-50' 
                    : 'border-peach-200 bg-white/80'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                    isActive || isCompleted 
                      ? 'bg-gradient-to-r from-coral-400 to-peach-400' 
                      : 'bg-warm-200'
                  }`}>
                    <StepIcon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <p className={`font-medium ${
                      isActive ? 'text-warm-800' : 'text-warm-600'
                    }`}>
                      {Step.text}
                    </p>
                  </div>

                  {isActive && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-coral-400 border-t-transparent rounded-full"
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-warm-200 rounded-full h-3 mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="bg-gradient-to-r from-coral-400 via-peach-400 to-mint-400 h-3 rounded-full relative overflow-hidden"
            transition={{ duration: 0.5 }}
          >
            {/* Shimmer effect */}
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
            />
          </motion.div>
        </div>

        <p className="text-warm-600 text-sm font-medium">
          {Math.round(progress)}% Complete
        </p>

        {/* Loading indicator for backend calls */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block w-5 h-5 border-2 border-coral-400 border-t-transparent rounded-full mr-2"
            />
            <span className="text-warm-600">Finding your perfect match...</span>
          </motion.div>
        )}

        {/* Floating hearts animation */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-coral-300/20"
              initial={{ y: '100vh', x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000) }}
              animate={{ 
                y: '-10vh',
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                rotate: [0, 360]
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "linear"
              }}
            >
              <Heart className="w-4 h-4" fill="currentColor" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AIMatching;