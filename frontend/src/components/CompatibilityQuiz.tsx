import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, ArrowLeft, LogOut, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getRandomQuestions, getHighWeightQuestions, Question } from '../data/questionBank';
import { useAuthStore } from '../stores/authStore';

const CompatibilityQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const navigate = useNavigate();
  const { dispatch, state } = useApp();
  const { user, signOut } = useAuthStore();

  // Generate dynamic questions based on personality answers
  useEffect(() => {
    const personalityAnswerIds = Object.keys(state.personalityAnswers);
    
    // Get high-weight questions for better matching
    const highWeightQuestions = getHighWeightQuestions(4, personalityAnswerIds);
    
    // Get additional questions from different categories
    const communicationQuestions = getRandomQuestions('communication', 2, personalityAnswerIds);
    const relationshipQuestions = getRandomQuestions('relationship', 2, personalityAnswerIds);
    const compatibilityQuestions = getRandomQuestions('compatibility', 1, personalityAnswerIds);
    
    const selectedQuestions = [
      ...highWeightQuestions,
      ...communicationQuestions,
      ...relationshipQuestions,
      ...compatibilityQuestions
    ].slice(0, 8); // Limit to 8 questions for better UX
    
    setQuestions(selectedQuestions);
  }, [state.personalityAnswers]);

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Combine all answers for matching algorithm
      const allAnswers = { ...state.personalityAnswers, ...answers };
      dispatch({ type: 'SET_COMPATIBILITY_ANSWERS', payload: allAnswers });
      navigate('/ai-matching');
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen warm-gradient flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-coral-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];
  const currentAnswer = answers[question.id];

  const renderQuestion = () => {
    switch (question.type) {
      case 'multiple':
        return (
          <div className="grid gap-3">
            {question.options?.map((option, index) => (
              <motion.button
                key={option.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleAnswer(question.id, option.value)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                  currentAnswer === option.value
                    ? 'border-coral-400 bg-coral-100 text-warm-800'
                    : 'border-peach-200 bg-white/80 text-warm-700 hover:border-coral-300 hover:bg-coral-50'
                }`}
              >
                {option.emoji && <span className="text-2xl">{option.emoji}</span>}
                <span className="font-medium">{option.label}</span>
              </motion.button>
            ))}
          </div>
        );
      
      case 'scale':
        return (
          <div className="space-y-6">
            <div className="flex justify-between text-sm text-warm-600 font-medium">
              <span>{question.labels?.[0]}</span>
              <span>{question.labels?.[1]}</span>
            </div>
            
            <div className="relative">
              <input
                type="range"
                min={question.min}
                max={question.max}
                value={currentAnswer || question.min}
                onChange={(e) => handleAnswer(question.id, parseInt(e.target.value))}
                className="w-full h-2 bg-peach-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #ff9a8b 0%, #ff9a8b ${((currentAnswer || question.min!) - question.min!) / (question.max! - question.min!) * 100}%, #fde2d9 ${((currentAnswer || question.min!) - question.min!) / (question.max! - question.min!) * 100}%, #fde2d9 100%)`
                }}
              />
              <div className="flex justify-between mt-2">
                {Array.from({ length: question.max! - question.min! + 1 }, (_, i) => (
                  <span key={i} className="text-xs text-warm-500">{question.min! + i}</span>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <span className="text-2xl font-bold text-coral-500">
                {currentAnswer || question.min}
              </span>
            </div>
          </div>
        );
      
      case 'boolean':
        return (
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => handleAnswer(question.id, true)}
              className={`p-6 rounded-xl border-2 transition-all ${
                currentAnswer === true
                  ? 'border-coral-400 bg-coral-100 text-warm-800'
                  : 'border-peach-200 bg-white/80 text-warm-700 hover:border-coral-300'
              }`}
            >
              <div className="text-3xl mb-2">✅</div>
              <div className="font-medium">Yes</div>
            </motion.button>
            
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => handleAnswer(question.id, false)}
              className={`p-6 rounded-xl border-2 transition-all ${
                currentAnswer === false
                  ? 'border-coral-400 bg-coral-100 text-warm-800'
                  : 'border-peach-200 bg-white/80 text-warm-700 hover:border-coral-300'
              }`}
            >
              <div className="text-3xl mb-2">❌</div>
              <div className="font-medium">No</div>
            </motion.button>
          </div>
        );
      
      default:
        return null;
    }
  };

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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-coral-400 to-peach-400 rounded-full mb-4 shadow-coral"
          >
            <Brain className="w-8 h-8 text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-friendly font-bold text-warm-800 mb-2">
            The magic begins here
          </h1>
          
          <p className="text-warm-600 font-medium mb-4">
            Our AI engine needs your honesty 💬
          </p>
          
          <p className="text-warm-600">
            Question {currentQuestion + 1} of {questions.length}
          </p>
          
          {/* Progress Bar */}
          <div className="w-full bg-peach-200 rounded-full h-2 mt-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="bg-gradient-to-r from-coral-400 to-peach-400 h-2 rounded-full"
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="friendly-card p-8"
        >
          <div className="text-center mb-8">
            {question.emoji && (
              <div className="text-6xl mb-4">{question.emoji}</div>
            )}
            <h2 className="text-2xl font-semibold text-warm-800 mb-6">
              {question.question}
            </h2>
            
            {/* Question weight indicator for high-importance questions */}
            {question.weight >= 8 && (
              <div className="inline-flex items-center gap-1 bg-yellow-100 border border-yellow-300 rounded-full px-3 py-1 mb-4">
                <span className="text-yellow-700 text-xs font-medium">High Impact Question</span>
              </div>
            )}
          </div>

          {renderQuestion()}
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 px-6 py-3 bg-white/80 text-warm-700 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextQuestion}
            disabled={currentAnswer === undefined || currentAnswer === null}
            className="flex items-center gap-2 px-6 py-3 friendly-button font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestion === questions.length - 1 ? 'Find My Match' : 'Next'}
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default CompatibilityQuiz;