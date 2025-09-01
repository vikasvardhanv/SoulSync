import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Gift, Users, Copy, Check, Mail, MessageCircle, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ReferFriend = () => {
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const { state } = useApp();

  const referralCode = `SOUL${state.user?.id?.slice(-6).toUpperCase()}`;
  const referralLink = `https://soulsync.ai/join?ref=${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Mock email sending
    setSent(true);
    setEmail('');
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          
          <div>
            <h1 className="text-3xl font-bold text-white">Refer Friends</h1>
            <p className="text-gray-300">Share the love, earn rewards</p>
          </div>
        </div>

        {/* Rewards Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Gift className="w-8 h-8 text-pink-400" />
            <div>
              <h2 className="text-xl font-semibold text-white">Earn $5 for Each Friend</h2>
              <p className="text-gray-300">They get 50% off, you get rewarded</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-400">$5</div>
              <div className="text-sm text-gray-300">Per successful referral</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">50%</div>
              <div className="text-sm text-gray-300">Friend's discount</div>
            </div>
          </div>
        </motion.div>

        {/* Your Referral Code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Your Referral Code
          </h3>
          
          <div className="bg-white/5 border border-white/20 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-mono font-bold text-pink-400">{referralCode}</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyToClipboard}
                className="flex items-center gap-2 bg-pink-500/20 border border-pink-500/30 text-pink-300 px-3 py-2 rounded-lg text-sm"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </motion.button>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/20 rounded-xl p-3">
            <p className="text-gray-300 text-sm break-all">{referralLink}</p>
          </div>
        </motion.div>

        {/* Send Invite */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send Personal Invite
          </h3>
          
          <form onSubmit={sendInvite} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Friend's email address"
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
              required
            />
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!email || sent}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
            >
              {sent ? 'Invite Sent! 🎉' : 'Send Invite'}
            </motion.button>
          </form>
        </motion.div>

        {/* Share Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Share on Social
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=Just found my perfect match on SoulSync! 💕 Join me with my referral code: ${referralCode}&url=${referralLink}`, '_blank')}
              className="bg-blue-500/20 border border-blue-500/30 text-blue-300 py-3 px-4 rounded-xl font-medium hover:bg-blue-500/30 transition-all"
            >
              Share on Twitter
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${referralLink}`, '_blank')}
              className="bg-blue-600/20 border border-blue-600/30 text-blue-300 py-3 px-4 rounded-xl font-medium hover:bg-blue-600/30 transition-all"
            >
              Share on Facebook
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReferFriend;