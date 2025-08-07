import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getRandomQuestions, getHighWeightQuestions, Question } from '../data/questionBank';

const CompatibilityQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const navigate = useNavigate();
  const { dispatch, state } = useApp();

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

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full"
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
                    ? 'border-purple-500 bg-purple-500/20 text-white'
                    : 'border-white/20 bg-white/5 text-gray-300 hover:border-purple-400 hover:bg-purple-400/10'
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
            <div className="flex justify-between text-sm text-gray-400">
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
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${((currentAnswer || question.min!) - question.min!) / (question.max! - question.min!) * 100}%, rgba(255,255,255,0.2) ${((currentAnswer || question.min!) - question.min!) / (question.max! - question.min!) * 100}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
              <div className="flex justify-between mt-2">
                {Array.from({ length: question.max! - question.min! + 1 }, (_, i) => (
                  <span key={i} className="text-xs text-gray-500">{question.min! + i}</span>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <span className="text-2xl font-bold text-purple-400">
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
                  ? 'border-purple-500 bg-purple-500/20 text-white'
                  : 'border-white/20 bg-white/5 text-gray-300 hover:border-purple-400'
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
                  ? 'border-purple-500 bg-purple-500/20 text-white'
                  : 'border-white/20 bg-white/5 text-gray-300 hover:border-purple-400'
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
    <div className="min-h-screen flex items-center justify-center p-4">
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
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full mb-4"
          >
            <Brain className="w-8 h-8 text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            The magic begins here
          </h1>
          
          <p className="text-gray-300 mb-4">
            Our AI engine needs your honesty 💬
          </p>
          
          <p className="text-gray-300">
            Question {currentQuestion + 1} of {questions.length}
          </p>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-2 mt-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full"
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
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            {question.emoji && (
              <div className="text-6xl mb-4">{question.emoji}</div>
            )}
            <h2 className="text-2xl font-semibold text-white mb-6">
              {question.question}
            </h2>
            
            {/* Question weight indicator for high-importance questions */}
            {question.weight >= 8 && (
              <div className="inline-flex items-center gap-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full px-3 py-1 mb-4">
                <span className="text-yellow-400 text-xs font-medium">High Impact Question</span>
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
            className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextQuestion}
            disabled={currentAnswer === undefined || currentAnswer === null}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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