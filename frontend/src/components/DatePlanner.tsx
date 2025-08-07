import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Star, ArrowLeft, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

const DatePlanner = () => {
  const [userZip, setUserZip] = useState('');
  const [matchZip, setMatchZip] = useState('');
  const [dateType, setDateType] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [venues, setVenues] = useState<any[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const navigate = useNavigate();
  const { state } = useApp();
  const match = state.currentMatch;

  const dateTypes = [
    { value: 'romantic', label: 'Romantic Dinner', emoji: '🕯️' },
    { value: 'casual', label: 'Casual Coffee', emoji: '☕' },
    { value: 'active', label: 'Active Date', emoji: '🏃‍♀️' },
    { value: 'cultural', label: 'Cultural Experience', emoji: '🎨' },
    { value: 'drinks', label: 'Cocktails & Drinks', emoji: '🍸' }
  ];

  const mockVenues = [
    {
      id: 1,
      name: "The Velvet Room",
      type: "Italian Restaurant",
      rating: 4.8,
      priceRange: "$$$",
      description: "Candlelit Italian dining with intimate ambiance",
      address: "123 Romance St",
      distance: "15 min from both",
      image: "https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=400",
      features: ["Candlelit", "Wine Selection", "Outdoor Seating"]
    },
    {
      id: 2,
      name: "Sunset Rooftop",
      type: "Wine Bar",
      rating: 4.9,
      priceRange: "$$",
      description: "Stunning city views with craft cocktails",
      address: "456 Skyline Ave",
      distance: "12 min from both",
      image: "https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=400",
      features: ["City Views", "Craft Cocktails", "Live Music"]
    },
    {
      id: 3,
      name: "Garden Café",
      type: "Coffee & Brunch",
      rating: 4.7,
      priceRange: "$$",
      description: "Charming garden setting perfect for conversation",
      address: "789 Garden Way",
      distance: "18 min from both",
      image: "https://images.pexels.com/photos/1307698/pexels-photo-1307698.jpeg?auto=compress&cs=tinysrgb&w=400",
      features: ["Garden Setting", "Brunch Menu", "Pet Friendly"]
    }
  ];

  const searchVenues = async () => {
    if (!userZip || !matchZip || !dateType) return;
    
    setIsSearching(true);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setVenues(mockVenues);
    setIsSearching(false);
  };

  const selectVenue = (venue: any) => {
    setSelectedVenue(venue);
  };

  if (!match) {
    navigate('/');
    return null;
  }

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
            <h1 className="text-3xl font-bold text-white">Plan Your Date</h1>
            <p className="text-gray-300">with {match.name}</p>
          </div>
        </div>

        {!venues.length ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Date Type Selection */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">What kind of date?</h2>
              <div className="grid grid-cols-2 gap-3">
                {dateTypes.map((type) => (
                  <motion.button
                    key={type.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDateType(type.value)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      dateType === type.value
                        ? 'border-pink-500 bg-pink-500/20 text-white'
                        : 'border-white/20 bg-white/5 text-gray-300 hover:border-pink-400'
                    }`}
                  >
                    <div className="text-2xl mb-2">{type.emoji}</div>
                    <div className="font-medium">{type.label}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Zip Code Input */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                Location Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Your Zip Code
                  </label>
                  <input
                    type="text"
                    value={userZip}
                    onChange={(e) => setUserZip(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                    placeholder="Enter your zip code"
                    maxLength={5}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {match.name}'s Zip Code
                  </label>
                  <input
                    type="text"
                    value={matchZip}
                    onChange={(e) => setMatchZip(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                    placeholder="Enter their zip code"
                    maxLength={5}
                  />
                </div>
              </div>
            </div>

            {/* Search Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={searchVenues}
              disabled={!userZip || !matchZip || !dateType || isSearching}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
            >
              {isSearching ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Finding Perfect Spots...
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5" />
                  Find Date Locations
                </>
              )}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Results Header */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                Perfect Spots Found! 💫
              </h2>
              <p className="text-gray-300">
                Romantic locations midway between you both
              </p>
            </div>

            {/* Venue Cards */}
            <div className="space-y-4">
              {venues.map((venue) => (
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className={`backdrop-blur-xl border-2 rounded-2xl overflow-hidden cursor-pointer transition-all ${
                    selectedVenue?.id === venue.id
                      ? 'border-pink-500 bg-pink-500/10'
                      : 'border-white/20 bg-white/10 hover:border-pink-400/50'
                  }`}
                  onClick={() => selectVenue(venue)}
                >
                  <div className="flex">
                    <img
                      src={venue.image}
                      alt={venue.name}
                      className="w-32 h-32 object-cover"
                    />
                    
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {venue.name}
                          </h3>
                          <p className="text-gray-400 text-sm">{venue.type}</p>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                          <span className="text-white font-medium">{venue.rating}</span>
                          <span className="text-gray-400 ml-2">{venue.priceRange}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-3">
                        {venue.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {venue.distance}
                        </div>
                        <div>{venue.address}</div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {venue.features.map((feature: string, index: number) => (
                          <span
                            key={index}
                            className="bg-white/10 text-gray-300 px-2 py-1 rounded-full text-xs"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Date Confirmation */}
            {selectedVenue && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="backdrop-blur-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-2xl p-6"
              >
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-pink-400" />
                  Perfect Choice!
                </h3>
                
                <p className="text-gray-300 mb-4">
                  This Friday at 7PM at {selectedVenue.name}? We'll notify {match.name} about your date suggestion!
                </p>
                
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    Confirm Date
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white/10 border border-white/20 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    View on Map
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DatePlanner;