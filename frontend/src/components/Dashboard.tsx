import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  User, 
  Settings, 
  LogOut, 
  MessageCircle, 
  Users, 
  Star,
  Bell,
  Search
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();

  // Debug logging
  console.log('Dashboard render - User:', user);
  console.log('Dashboard render - Loading:', loading);

  useEffect(() => {
    console.log('Dashboard useEffect - User:', user);
    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    console.log('Logout clicked');
    await signOut();
    navigate('/');
  };

  if (!user) {
    console.log('Rendering loading state - no user');
    return (
      <div className="min-h-screen warm-gradient flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500"></div>
          <p className="text-warm-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  console.log('Rendering main dashboard');

  return (
    <div className="min-h-screen warm-gradient">
      {/* Header */}
      <header className="bg-white/20 backdrop-blur-lg border-b border-white/30">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-coral-400 to-peach-400 rounded-full flex items-center justify-center shadow-coral">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-friendly font-bold text-warm-800">SoulSync</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => setActiveTab('discover')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium ${
                  activeTab === 'discover' 
                    ? 'bg-coral-400 text-white shadow-coral' 
                    : 'text-warm-700 hover:text-warm-900 hover:bg-white/20'
                }`}
              >
                <Search className="w-5 h-5" />
                <span>Discover</span>
              </button>
              
              <button
                onClick={() => setActiveTab('matches')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium ${
                  activeTab === 'matches' 
                    ? 'bg-coral-400 text-white shadow-coral' 
                    : 'text-warm-700 hover:text-warm-900 hover:bg-white/20'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Matches</span>
              </button>
              
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium ${
                  activeTab === 'messages' 
                    ? 'bg-coral-400 text-white shadow-coral' 
                    : 'text-warm-700 hover:text-warm-900 hover:bg-white/20'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                <span>Messages</span>
              </button>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-warm-700 hover:text-warm-900 hover:bg-white/20 rounded-lg transition-all">
                <Bell className="w-6 h-6" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-coral-500 rounded-full"></div>
              </button>
              
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/20 transition-all">
                  <div className="w-8 h-8 bg-gradient-to-r from-coral-400 to-peach-400 rounded-full flex items-center justify-center shadow-coral">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-warm-800 font-medium hidden md:block">{user.name || 'User'}</span>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 friendly-card border border-white/30 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="py-2">
                    <button
                      onClick={() => navigate('/profile')}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-warm-700 hover:text-warm-900 hover:bg-white/20 transition-all"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => navigate('/settings')}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-warm-700 hover:text-warm-900 hover:bg-white/20 transition-all"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Debug Info */}
        <div className="friendly-card p-4 mb-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">Debug Information</h3>
          <p className="text-blue-700 text-sm">User ID: {user.id}</p>
          <p className="text-blue-700 text-sm">User Name: {user.name}</p>
          <p className="text-blue-700 text-sm">User Email: {user.email}</p>
          <p className="text-blue-700 text-sm">Active Tab: {activeTab}</p>
        </div>

        {activeTab === 'discover' && (
          <div className="space-y-6">
            {/* Profile Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="friendly-card p-6"
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-coral-400 to-peach-400 rounded-full flex items-center justify-center shadow-coral">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-friendly font-bold text-warm-800">{user.name || 'Unknown User'}</h2>
                  <p className="text-warm-600">{user.age || 'Unknown age'} years old • {user.location || 'Unknown location'}</p>
                  <p className="text-warm-700 mt-2">{user.bio || 'No bio available'}</p>
                </div>
              </div>
            </motion.div>

            {/* Welcome Message */}
            <div className="friendly-card p-8 text-center">
              <h3 className="text-2xl font-friendly font-bold text-warm-800 mb-4">Welcome to SoulSync!</h3>
              <p className="text-warm-600 mb-6">Your dashboard is loading. Soon you'll be able to discover amazing matches!</p>
              <button
                onClick={() => navigate('/personality-quiz')}
                className="friendly-button px-6 py-3 font-medium"
              >
                Take Personality Quiz
              </button>
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-friendly font-bold text-warm-800 mb-4">Your Matches</h2>
            <p className="text-warm-600">This feature is coming soon!</p>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-friendly font-bold text-warm-800 mb-4">Messages</h2>
            <p className="text-warm-600">This feature is coming soon!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;