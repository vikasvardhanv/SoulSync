import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import WelcomePage from './components/WelcomePage';
import PersonalityQuiz from './components/PersonalityQuiz';
import PaymentModal from './components/PaymentModal';
import CompatibilityQuiz from './components/CompatibilityQuiz';
import AIMatching from './components/AIMatching';
import MatchReveal from './components/MatchReveal';
import ChatInterface from './components/ChatInterface';
import DatePlanner from './components/DatePlanner';
import AdditionalQuestions from './components/AdditionalQuestions';
import ReferFriend from './components/ReferFriend';
import ProductionFeatures from './components/ProductionFeatures';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import Dashboard from './components/Dashboard';
import { AppProvider, useApp } from './context/AppContext';
import { useAuthStore } from './stores/authStore';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen warm-gradient flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-coral-200 border-t-coral-500 rounded-full animate-spin"></div>
          <p className="text-warm-600 font-medium">Loading your experience...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function AppContent() {
  const { user } = useAuthStore();
  const { dispatch } = useApp();
  
  // Sync user data from auth store to app context
  useEffect(() => {
    if (user) {
      dispatch({ 
        type: 'SET_USER', 
        payload: user
      });
    } else {
      dispatch({ type: 'SET_USER', payload: null });
    }
  }, [user, dispatch]);
  
  return (
    <Router>
      <div className="min-h-screen warm-gradient">
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* Legacy Routes (Protected) */}
            <Route path="/personality-quiz" element={
              <ProtectedRoute>
                <PersonalityQuiz />
              </ProtectedRoute>
            } />
            <Route path="/payment" element={
              <ProtectedRoute>
                <PaymentModal />
              </ProtectedRoute>
            } />
            <Route path="/compatibility-quiz" element={
              <ProtectedRoute>
                <CompatibilityQuiz />
              </ProtectedRoute>
            } />
            <Route path="/ai-matching" element={
              <ProtectedRoute>
                <AIMatching />
              </ProtectedRoute>
            } />
            <Route path="/match-reveal" element={
              <ProtectedRoute>
                <MatchReveal />
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <ChatInterface />
              </ProtectedRoute>
            } />
            <Route path="/date-planner" element={
              <ProtectedRoute>
                <DatePlanner />
              </ProtectedRoute>
            } />
            <Route path="/additional-questions" element={
              <ProtectedRoute>
                <AdditionalQuestions />
              </ProtectedRoute>
            } />
            <Route path="/refer-friend" element={
              <ProtectedRoute>
                <ReferFriend />
              </ProtectedRoute>
            } />
            <Route path="/production-features" element={
              <ProtectedRoute>
                <ProductionFeatures />
              </ProtectedRoute>
            } />
          </Routes>
        </AnimatePresence>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 154, 139, 0.2)',
              color: '#2d3748',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: 'white',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;