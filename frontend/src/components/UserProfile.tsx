import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  CreditCard, 
  Users, 
  Heart, 
  LogOut, 
  ChevronRight,
  Edit3,
  Gift,
  Shield,
  Bell,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const UserProfile = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const menuItems = [
    { icon: Edit3, label: 'Edit Profile', path: '/edit-profile' },
    { icon: CreditCard, label: 'Billing & Payments', path: '/billing' },
    { icon: Users, label: 'Refer Friends', path: '/refer-friend' },
    { icon: Heart, label: 'Match History', path: '/match-history' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Shield, label: 'Privacy & Safety', path: '/privacy' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: Users, label: 'Production Features', path: '/production-features' },
    { icon: HelpCircle, label: 'Help & Support', path: '/help' },
  ];

  const handleLogout = () => {
    dispatch({ type: 'SET_USER', payload: null });
    navigate('/');
  };

  return (
    <div className="relative">
      {/* Profile Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full border-2 border-white/20 hover:border-white/40 transition-all"
      >
        <User className="w-5 h-5 text-white" />
        
        {/* Notification Badge */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900"></div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-12 right-0 w-72 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{state.user?.name || 'User'}</h3>
                    <p className="text-gray-400 text-sm">{state.user?.email}</p>
                  </div>
                </div>
                
                {/* Premium Badge */}
                <div className="mt-3 inline-flex items-center gap-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full px-3 py-1">
                  <Gift className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-xs font-medium">Premium Member</span>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      navigate(item.path);
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-all group"
                  >
                    <item.icon className="w-5 h-5 group-hover:text-pink-400 transition-colors" />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                ))}
              </div>

              {/* Logout */}
              <div className="border-t border-white/10 p-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;