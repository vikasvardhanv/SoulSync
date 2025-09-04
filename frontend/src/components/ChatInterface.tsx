import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Send, Heart, MapPin, Calendar, Smile, ArrowLeft, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { messagesAPI } from '../services/api';
import UserProfile from './UserProfile';

const ChatInterface = () => {
  const [message, setMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const match = state.acceptedMatch || state.currentMatch;

  const iceBreakers = [
    "I see you love travel! What's your dream destination? ✈️",
    "Your photography skills look amazing! What's your favorite subject? 📸",
    "Fellow foodie here! What's your go-to comfort food? 🍜",
    "I love that you're into yoga! How long have you been practicing? 🧘‍♀️"
  ];

  const aiSuggestions = [
    "You both love sushi — ask about their favorite place!",
    "They mentioned hiking — share your favorite trail!",
    "Perfect time to suggest meeting up! 💫"
  ];


  // Fetch messages for current conversation
  const fetchMessages = async (userId: string) => {
    try {
      const response = await messagesAPI.getConversation(userId, {
        limit: 50,
        offset: 0
      });
      const { messages } = response.data.data;
      
      // Update messages in context
      dispatch({
        type: 'SET_MESSAGES',
        payload: messages.map((msg: any) => ({
          id: msg.id,
          senderId: msg.senderId,
          content: msg.content,
          timestamp: new Date(msg.createdAt),
          isRead: msg.isRead
        }))
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
    }
  };

  useEffect(() => {
    if (match) {
      fetchMessages(match.id);
    }
  }, [match]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  // Add initial messages if none exist
  useEffect(() => {
    if (state.messages.length === 0 && match) {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          senderId: match.id,
          content: `Hey! I'm so excited we matched! Your profile really caught my attention 😊`
        }
      });
      
      setTimeout(() => {
        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            senderId: match.id,
            content: `Our compatibility score is incredible! I'd love to get to know you better 💫`
          }
        });
      }, 2000);
    }
  }, [match, state.messages.length, dispatch]);

  if (!match) {
    navigate('/');
    return null;
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || !match) return;

    try {
      setIsLoading(true);
      setError(null);

      // Send message to backend
      await messagesAPI.sendMessage({
        receiverId: match.id,
        content: content.trim()
      });

      // Add message to local state
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          senderId: state.user?.id || 'user',
          content: content.trim(),
          timestamp: new Date()
        }
      });

      setMessage('');
      setShowSuggestions(false);

      // Simulate match response after user sends 5+ messages
      if (state.messages.filter(m => m.senderId === state.user?.id).length >= 4) {
        setTimeout(() => {
          dispatch({
            type: 'ADD_MESSAGE',
            payload: {
              senderId: match.id,
              content: "This conversation is going so well! Would you like to meet up sometime? I know a great place we could check out together 😊"
            }
          });
          
          // Show date planner suggestion after a few more exchanges
          setTimeout(() => {
            setShowDateSuggestion(true);
          }, 3000);
        }, 1500);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const [showDateSuggestion, setShowDateSuggestion] = useState(false);

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-full mb-6"
          >
            <AlertCircle className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-3xl font-bold text-white mb-4">
            Oops! 😅
          </h1>

          <p className="text-gray-300 text-lg mb-6">
            {error}
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/10 border-b border-white/20 p-4 flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </motion.button>
        
        <img
          src={match.photo || match.photos?.[0] || 'https://via.placeholder.com/48'}
          alt={match.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-pink-500/50"
        />
        
        <div className="flex-1">
          <h2 className="text-white font-semibold">{match.name}</h2>
          <div className="flex items-center gap-1 text-sm text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            Online now
          </div>
        </div>

        <div className="flex items-center gap-1 bg-pink-500/20 border border-pink-500/30 rounded-full px-3 py-1">
          <Heart className="w-4 h-4 text-pink-400" fill="currentColor" />
          <span className="text-pink-400 font-semibold text-sm">
            {match.compatibility || '9.2'}
          </span>
        </div>
        
        {/* User Profile Menu */}
        <UserProfile />
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <AnimatePresence>
          {state.messages.map((msg) => {
            const isUser = msg.senderId === state.user?.id;
            
            return (
              <motion.div
                key={msg.id || Math.random()}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  isUser
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                    : 'bg-white/10 backdrop-blur-sm text-gray-100 border border-white/20'
                } ${
                  isUser ? 'rounded-br-sm' : 'rounded-bl-sm'
                }`}>
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    isUser ? 'text-pink-100' : 'text-gray-400'
                  }`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* AI Suggestions */}
        {state.messages.length > 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-400 text-sm font-medium">SoulSync AI suggests:</span>
            </div>
            <p className="text-gray-300 text-sm">
              {aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)]}
            </p>
          </motion.div>
        )}

        {/* Date Suggestion Popup */}
        <AnimatePresence>
          {showDateSuggestion && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-pink-400" />
                <span className="text-white font-semibold">Things are heating up!</span>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Want to meet? Enter your zip codes, and we'll find a romantic spot midway.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/date-planner')}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Plan Our Date
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Ice Breakers */}
      {showSuggestions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-white/10"
        >
          <p className="text-gray-400 text-sm mb-3 text-center">Conversation starters:</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {iceBreakers.map((suggestion, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => sendMessage(suggestion)}
                disabled={isLoading}
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-gray-300 px-4 py-2 rounded-full text-sm whitespace-nowrap hover:bg-pink-500/20 hover:border-pink-500/30 hover:text-white transition-all disabled:opacity-50"
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-white/10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(message);
          }}
          className="flex gap-3"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={isLoading}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all disabled:opacity-50"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <Smile className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!message.trim() || isLoading}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </form>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full mr-2"
            />
            <span className="text-gray-300 text-sm">Sending message...</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;