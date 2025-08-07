// frontend/src/components/MatchReveal.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, X, AlertCircle, Sparkles, Star, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { matchesAPI } from '../services/api';
import UserProfilePreview from './UserProfilePreview';
import toast from 'react-hot-toast';

const MatchReveal = () => {
  const [isDeciding, setIsDeciding] = useState(false);
  const [showDailyLimit, setShowDailyLimit] = useState(false);
  const [showProfilePreview, setShowProfilePreview] = useState(false);
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const match = state.currentMatch;

  // Mock additional matches for demonstration
  const mockMatches = [
    {
      id: '2',
      name: 'Alex',
      age: 26,
      bio: 'Coffee enthusiast and weekend hiker. Looking for someone to explore the city with.',
      interests: ['Coffee', 'Hiking', 'Art', 'Music'],
      compatibility: 9.2,
      photo: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
      photos: [
        'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400'
      ],
      location: 'San Francisco, CA'
    },
    {
      id: '3',
      name: 'Jordan',
      age: 30,
      bio: 'Bookworm by day, chef by night. Love trying new recipes and cozy conversations.',
      interests: ['Reading', 'Cooking', 'Wine', 'Theater'],
      compatibility: 8.9,
      photo: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
      photos: [
        'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1819483/pexels-photo-1819483.jpeg?auto=compress&cs=tinysrgb&w=400'
      ],
      location: 'Oakland, CA'
    },
    {
      id: '4',
      name: 'Sam',
      age: 29,
      bio: 'Fitness enthusiast and dog lover. Always up for outdoor adventures and good conversations.',
      interests: ['Fitness', 'Dogs', 'Outdoor', 'Photography'],
      compatibility: 8.7,
      photo: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400',
      photos: [
        'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400'
      ],
      location: 'Berkeley, CA'
    },
    {
      id: '5',
      name: 'Riley',
      age: 27,
      bio: 'Creative soul with a passion for music and art. Looking for deep connections and shared experiences.',
      interests: ['Music', 'Art', 'Writing', 'Travel'],
      compatibility: 8.5,
      photo: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
      photos: [
        'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1385472/pexels-photo-1385472.jpeg?auto=compress&cs=tinysrgb&w=400'
      ],
      location: 'San Jose, CA'
    }
  ];

  if (!match) {
    navigate('/ai-matching');
    return null;
  }

  const compatibilityAreas = [
    { label: 'Emotional Intelligence', score: Math.round((match.compatibility - 1) * 10) / 10 },
    { label: 'Communication Style', score: Math.round((match.compatibility - 0.3) * 10) / 10 },
    { label: 'Life Goals', score: Math.round((match.compatibility + 0.1) * 10) / 10 },
    { label: 'Humor Compatibility', score: Math.round((match.compatibility - 0.4) * 10) / 10 },
    { label: 'Values Alignment', score: Math.round((match.compatibility - 0.1) * 10) / 10 }
 ];

 const handleAccept = async () => {
   setIsDeciding(true);
   try {
     // Create match in backend
     await matchesAPI.createMatch({
       matchedUserId: match.id,
       compatibilityScore: match.compatibility
     });
     
     dispatch({ type: 'ACCEPT_MATCH', payload: match });
     navigate('/chat');
   } catch (error: any) {
     console.error('Error creating match:', error);
     if (error.response?.data?.message?.includes('Daily match limit')) {
       toast.error('Daily match limit reached! You can only match with 2 people per day.');
       setShowDailyLimit(true);
     } else {
       toast.error('Failed to create match. Please try again.');
     }
     setIsDeciding(false);
   }
 };

 const handleReject = async () => {
   setIsDeciding(true);
   
   try {
     // Create match in backend (will be rejected)
     await matchesAPI.createMatch({
       matchedUserId: match.id,
       compatibilityScore: match.compatibility
     });
     
     dispatch({ type: 'REJECT_MATCH', payload: match });
     
     // Check if user has reached daily limit
     const today = new Date().toDateString();
     const isNewDay = state.lastMatchDate !== today;
     const newCount = isNewDay ? 1 : state.dailyMatchCount + 1;
     
     // Determine match limit based on subscription status
     const matchLimit = state.hasPremium ? 10 : 2;
     
     if (newCount >= matchLimit) {
       setShowDailyLimit(true);
       setIsDeciding(false);
     } else {
       // Find next match that hasn't been rejected
       const rejectedIds = [...state.rejectedMatches.map(m => m.id), match.id];
       const nextMatch = mockMatches.find(m => !rejectedIds.includes(m.id));
       
       if (nextMatch) {
         setTimeout(() => {
           dispatch({ type: 'SET_MATCH', payload: nextMatch });
           setIsDeciding(false);
         }, 1500);
       } else {
         // No more matches available today
         setShowDailyLimit(true);
         setIsDeciding(false);
       }
     }
   } catch (error: any) {
     console.error('Error creating match:', error);
     if (error.response?.data?.message?.includes('Daily match limit')) {
       toast.error('Daily match limit reached! You can only match with 2 people per day.');
       setShowDailyLimit(true);
     } else {
       toast.error('Failed to process match. Please try again.');
     }
     setIsDeciding(false);
   }
 };

 const handleProfileAction = (action: 'like' | 'pass') => {
   setShowProfilePreview(false);
   if (action === 'like') {
     handleAccept();
   } else {
     handleReject();
   }
 };

 if (showDailyLimit) {
   return (
     <div className="min-h-screen flex items-center justify-center p-4">
       <motion.div
         initial={{ opacity: 0, scale: 0.8 }}
         animate={{ opacity: 1, scale: 1 }}
         className="w-full max-w-md text-center"
       >
         <motion.div
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           transition={{ delay: 0.2, type: "spring" }}
           className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-6"
         >
           <AlertCircle className="w-10 h-10 text-white" />
         </motion.div>

         <h1 className="text-3xl font-bold text-white mb-4">
           Daily Match Limit Reached
         </h1>

         <p className="text-gray-300 text-lg mb-6 max-w-sm mx-auto">
           You've seen your 2 matches for today. Quality over quantity - come back tomorrow for fresh connections! 💫
         </p>

         <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
           <h3 className="text-lg font-semibold text-white mb-3">Why the limit?</h3>
           <div className="space-y-2 text-sm text-gray-300">
             <p>• Prevents decision fatigue</p>
             <p>• Ensures thoughtful connections</p>
             <p>• Better matches with fresh perspective</p>
             <p>• Quality over quantity approach</p>
           </div>
         </div>

         <motion.button
           whileHover={{ scale: 1.02 }}
           whileTap={{ scale: 0.98 }}
           onClick={() => navigate('/')}
           className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all"
         >
           Return Tomorrow
         </motion.button>

         <p className="text-gray-400 text-sm mt-4">
           New matches available in 24 hours
         </p>
       </motion.div>
     </div>
   );
 }

 return (
   <div className="min-h-screen flex items-center justify-center p-4">
     <motion.div
       initial={{ opacity: 0, scale: 0.8 }}
       animate={{ opacity: 1, scale: 1 }}
       transition={{ duration: 0.8, ease: "easeOut" }}
       className="w-full max-w-lg"
     >
       {/* Match Counter */}
       <motion.div
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
         className="text-center mb-4"
       >
         <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2">
           <Heart className="w-4 h-4 text-pink-400" fill="currentColor" />
           <span className="text-white text-sm">
             Match {state.dailyMatchCount + 1} of 2 today
           </span>
         </div>
       </motion.div>

       {/* Celebration Effect */}
       <motion.div
         initial={{ scale: 0 }}
         animate={{ scale: [0, 1.2, 1] }}
         transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
         className="text-center mb-6"
       >
         <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-full px-6 py-3">
           <Sparkles className="w-5 h-5 text-yellow-400" />
           <span className="text-white font-semibold">Perfect Match Found!</span>
           <Sparkles className="w-5 h-5 text-yellow-400" />
         </div>
       </motion.div>

       {/* Match Card */}
       <motion.div
         key={match.id}
         initial={{ y: 50, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         transition={{ delay: 0.3, duration: 0.6 }}
         className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden shadow-2xl"
       >
         {/* Profile Header */}
         <div className="relative p-6 text-center">
           <motion.div
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             transition={{ delay: 0.5, type: "spring" }}
             className="relative inline-block"
           >
             <img
               src={match.photo || match.photos?.[0] || 'https://via.placeholder.com/150'}
               alt={match.name}
               className="w-32 h-32 rounded-full object-cover border-4 border-gradient-to-r from-pink-500 to-purple-500 shadow-xl"
             />
             
             {/* Compatibility Score Badge */}
             <motion.div
               initial={{ scale: 0, rotate: -180 }}
               animate={{ scale: 1, rotate: 0 }}
               transition={{ delay: 0.8, type: "spring" }}
               className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full p-2 border-4 border-white/20"
             >
               <div className="text-white text-xs font-bold">
                 {match.compatibility}
               </div>
             </motion.div>
           </motion.div>

           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.7 }}
             className="mt-4"
           >
             <h2 className="text-3xl font-bold text-white mb-2">
               Meet {match.name}
             </h2>
             
             <div className="flex items-center justify-center gap-2 mb-3">
               <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
               <span className="text-2xl font-bold text-pink-400">
                 {match.compatibility}/10
               </span>
               <span className="text-gray-300">compatibility match</span>
             </div>

             <p className="text-gray-300 text-sm max-w-sm mx-auto">
               SoulSync says you two really feel each other 💫
             </p>
           </motion.div>
         </div>

         {/* Match Details */}
         <div className="p-6 space-y-6">
           {/* Bio */}
           <motion.div
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.9 }}
           >
             <h3 className="text-lg font-semibold text-white mb-2">About {match.name}</h3>
             <p className="text-gray-300">{match.bio}</p>
             {match.location && (
               <p className="text-gray-400 text-sm mt-2">📍 {match.location}</p>
             )}
           </motion.div>

           {/* Photo Count Indicator */}
           {match.photos && match.photos.length > 1 && (
             <motion.div
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 1.0 }}
               className="bg-white/5 rounded-lg p-3"
             >
               <p className="text-gray-300 text-sm">
                 📸 {match.photos.length} photos available in full profile
               </p>
             </motion.div>
           )}

           {/* Interests */}
           <motion.div
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 1.1 }}
           >
             <h3 className="text-lg font-semibold text-white mb-3">Shared Interests</h3>
             <div className="flex flex-wrap gap-2">
               {match.interests.map((interest, index) => (
                 <motion.span
                   key={interest}
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   transition={{ delay: 1.3 + index * 0.1 }}
                   className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-300 px-3 py-1 rounded-full text-sm"
                 >
                   {interest}
                 </motion.span>
               ))}
             </div>
           </motion.div>

           {/* Compatibility Breakdown */}
           <motion.div
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 1.5 }}
           >
             <h3 className="text-lg font-semibold text-white mb-3">Compatibility Breakdown</h3>
             <div className="space-y-3">
               {compatibilityAreas.map((area, index) => (
                 <motion.div
                   key={area.label}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 1.7 + index * 0.1 }}
                   className="flex items-center justify-between"
                 >
                   <span className="text-gray-300 text-sm">{area.label}</span>
                   <div className="flex items-center gap-2">
                     <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                       <motion.div
                         initial={{ width: 0 }}
                         animate={{ width: `${(area.score / 10) * 100}%` }}
                         transition={{ delay: 1.9 + index * 0.1, duration: 0.5 }}
                         className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"
                       />
                     </div>
                     <span className="text-pink-400 font-semibold text-sm">
                       {area.score}
                     </span>
                   </div>
                 </motion.div>
               ))}
             </div>
           </motion.div>
         </div>

         {/* View Profile Button */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 2.0 }}
           className="px-6 pb-4"
         >
           <motion.button
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             onClick={() => setShowProfilePreview(true)}
             className="w-full bg-white/10 border border-white/20 text-white py-3 px-6 rounded-xl font-medium mb-4 hover:bg-white/20 transition-all flex items-center justify-center gap-2"
           >
             <Eye className="w-5 h-5" />
             View Full Profile
           </motion.button>
         </motion.div>
       </motion.div>

       {/* Action Buttons */}
       <AnimatePresence>
         {!isDeciding && (
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             transition={{ delay: 2.2 }}
             className="mt-6 flex gap-4"
           >
             <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={handleReject}
               className="flex-1 bg-white/10 border border-red-500/30 text-red-400 py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all"
             >
               <X className="w-5 h-5" />
               Pass
             </motion.button>

             <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={handleAccept}
               className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
             >
               <Heart className="w-5 h-5" fill="currentColor" />
               Like
             </motion.button>
           </motion.div>
         )}
       </AnimatePresence>

       {/* Decision Loading */}
       <AnimatePresence>
         {isDeciding && (
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             className="mt-6 text-center"
           >
             <motion.div
               animate={{ rotate: 360 }}
               transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
               className="inline-block w-8 h-8 border-2 border-pink-400 border-t-transparent rounded-full mb-2"
             />
             <p className="text-gray-300">
               {state.dailyMatchCount >= 1 ? 'Finding your next match...' : 'Processing your choice...'}
             </p>
           </motion.div>
         )}
       </AnimatePresence>

       {/* Floating hearts for celebration */}
       <div className="fixed inset-0 pointer-events-none overflow-hidden">
         {[...Array(15)].map((_, i) => (
           <motion.div
             key={i}
             className="absolute text-pink-400/40"
             initial={{ 
               y: window.innerHeight + 50,
               x: Math.random() * window.innerWidth,
               rotate: 0,
               scale: Math.random() * 0.5 + 0.5
             }}
             animate={{ 
               y: -50,
               rotate: 360,
               x: Math.random() * window.innerWidth
             }}
             transition={{
               duration: Math.random() * 3 + 4,
               delay: Math.random() * 2,
               ease: "easeOut"
             }}
           >
             <Heart className="w-6 h-6" fill="currentColor" />
           </motion.div>
         ))}
       </div>
     </motion.div>

     {/* User Profile Preview Modal */}
     <UserProfilePreview
       user={{
         ...match,
         photos: match.photos || [match.photo].filter(Boolean)
       }}
       isOpen={showProfilePreview}
       onClose={() => setShowProfilePreview(false)}
       onAction={handleProfileAction}
       showActions={true}
     />
   </div>
 );
};

export default MatchReveal;