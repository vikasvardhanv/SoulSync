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
  Search,
  Filter,
  Plus
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { AIMatchingService } from '../services/aiMatching';

interface Match {
  id: string;
  name: string;
  age: number;
  bio: string;
  interests: string[];
  photos: string[];
  compatibility_score: number;
  reasoning: string;
  conversation_starters: string[];
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuthStore();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (activeTab === 'discover') {
      loadMatches();
    }
  }, [user, activeTab, navigate]);

  const loadMatches = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const matchResults = await AIMatchingService.findMatches(user.id, 10);
      setMatches(matchResults.map(result => ({
        id: result.candidate.id,
        name: result.candidate.name,
        age: result.candidate.age,
        bio: result.candidate.bio,
        interests: result.candidate.interests,
        photos: result.candidate.photos,
        compatibility_score: result.compatibility_score,
        reasoning: result.reasoning,
        conversation_starters: result.conversation_starters,
      })));
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptMatch = async (match: Match) => {
    if (!user) return;
    
    try {
      await AIMatchingService.saveMatch(user.id, match.id, match.compatibility_score);
      await AIMatchingService.updateMatchStatus(match.id, 'accepted');
      
      // Move to next match
      setCurrentMatchIndex(prev => prev + 1);
      
      // Navigate to chat
      navigate('/chat', { state: { match } });
    } catch (error) {
      console.error('Error accepting match:', error);
    }
  };

  const handleRejectMatch = async (match: Match) => {
    if (!user) return;
    
    try {
      await AIMatchingService.saveMatch(user.id, match.id, match.compatibility_score);
      await AIMatchingService.updateMatchStatus(match.id, 'rejected');
      
      // Move to next match
      setCurrentMatchIndex(prev => prev + 1);
    } catch (error) {
      console.error('Error rejecting match:', error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const currentMatch = matches[currentMatchIndex];

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">SoulSync</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => setActiveTab('discover')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'discover' 
                    ? 'bg-pink-500 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Search className="w-5 h-5" />
                <span>Discover</span>
              </button>
              
              <button
                onClick={() => setActiveTab('matches')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'matches' 
                    ? 'bg-pink-500 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Matches</span>
              </button>
              
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'messages' 
                    ? 'bg-pink-500 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                <span>Messages</span>
              </button>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-300 hover:text-white">
                <Bell className="w-6 h-6" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              </button>
              
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white hidden md:block">{profile.name}</span>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="py-2">
                    <button
                      onClick={() => navigate('/profile')}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => navigate('/settings')}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
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
        {activeTab === 'discover' && (
          <div className="space-y-6">
            {/* Profile Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                  <p className="text-gray-400">{profile.age} years old • {profile.location}</p>
                  <p className="text-gray-300 mt-2">{profile.bio}</p>
                </div>
              </div>
            </motion.div>

            {/* Match Card */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
              </div>
            ) : currentMatch ? (
              <motion.div
                key={currentMatch.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden"
              >
                {/* Match Photo */}
                <div className="relative h-96 bg-gradient-to-br from-pink-500/20 to-purple-600/20">
                  {currentMatch.photos[0] ? (
                    <img
                      src={currentMatch.photos[0]}
                      alt={currentMatch.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-24 h-24 text-white/50" />
                    </div>
                  )}
                  
                  {/* Compatibility Score */}
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-lg rounded-full px-3 py-1">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white font-semibold">{currentMatch.compatibility_score}/10</span>
                    </div>
                  </div>
                </div>

                {/* Match Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{currentMatch.name}, {currentMatch.age}</h3>
                      <p className="text-gray-300 mt-2">{currentMatch.bio}</p>
                    </div>
                  </div>

                  {/* Interests */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentMatch.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Compatibility Reasoning */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Why you're compatible</h4>
                    <p className="text-gray-300 text-sm">{currentMatch.reasoning}</p>
                  </div>

                  {/* Conversation Starters */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Conversation Starters</h4>
                    <div className="space-y-2">
                      {currentMatch.conversation_starters.map((starter, index) => (
                        <div
                          key={index}
                          className="p-3 bg-white/5 rounded-lg text-gray-300 text-sm"
                        >
                          "{starter}"
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRejectMatch(currentMatch)}
                      className="flex-1 py-3 px-6 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Pass
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAcceptMatch(currentMatch)}
                      className="flex-1 py-3 px-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
                    >
                      Like
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No more matches</h3>
                <p className="text-gray-400">Check back later for new potential matches!</p>
                <button
                  onClick={loadMatches}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-white mb-4">Your Matches</h2>
            <p className="text-gray-400">This feature is coming soon!</p>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-white mb-4">Messages</h2>
            <p className="text-gray-400">This feature is coming soon!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard; 