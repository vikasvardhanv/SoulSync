import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Shield, 
  Brain, 
  TrendingUp, 
  Users, 
  DollarSign,
  Eye,
  Lock,
  Zap,
  Heart,
  Star,
  CheckCircle
} from 'lucide-react';

const ProductionFeatures = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeMatches: 0,
    successRate: 0,
    revenue: 0
  });

  // Simulate real-time metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        totalUsers: Math.min(prev.totalUsers + Math.floor(Math.random() * 3), 19247),
        activeMatches: Math.min(prev.activeMatches + Math.floor(Math.random() * 2), 8934),
        successRate: Math.min(prev.successRate + 0.1, 94.7),
        revenue: Math.min(prev.revenue + Math.floor(Math.random() * 50), 127450)
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const features = {
    analytics: {
      title: "Behavioral Analytics & ML Pipeline",
      icon: BarChart3,
      items: [
        {
          title: "User Interaction Tracking",
          description: "Track swipes, message response rates, and conversation quality to improve matching algorithms",
          icon: Eye,
          status: "active"
        },
        {
          title: "Machine Learning Pipeline",
          description: "Continuous learning from successful matches to refine compatibility scoring",
          icon: Brain,
          status: "active"
        },
        {
          title: "A/B Testing Framework",
          description: "Test question variations, UI optimizations, and matching algorithms",
          icon: TrendingUp,
          status: "development"
        },
        {
          title: "Retention Analytics",
          description: "Track daily/monthly active users and match success rates",
          icon: Users,
          status: "active"
        }
      ]
    },
    security: {
      title: "Security & Trust Features",
      icon: Shield,
      items: [
        {
          title: "Identity Verification",
          description: "Phone/email verification and AI-powered photo authentication",
          icon: CheckCircle,
          status: "active"
        },
        {
          title: "Privacy Controls",
          description: "Granular privacy settings with end-to-end encryption",
          icon: Lock,
          status: "active"
        },
        {
          title: "Safety Features",
          description: "Block/report functionality, background checks, emergency contacts",
          icon: Shield,
          status: "development"
        },
        {
          title: "GDPR Compliance",
          description: "Full compliance with GDPR, CCPA for global market expansion",
          icon: CheckCircle,
          status: "active"
        }
      ]
    },
    engagement: {
      title: "Engagement & Growth",
      icon: Zap,
      items: [
        {
          title: "Push Notifications",
          description: "Smart notifications for new matches, messages, and engagement",
          icon: Zap,
          status: "development"
        },
        {
          title: "Gamification",
          description: "Daily match limits, streak rewards, and achievement systems",
          icon: Star,
          status: "active"
        },
        {
          title: "Viral Mechanics",
          description: "Referral tracking, social proof, and viral sharing features",
          icon: Users,
          status: "active"
        },
        {
          title: "Conversion Funnels",
          description: "Track user journey and optimize drop-off points",
          icon: TrendingUp,
          status: "active"
        }
      ]
    },
    monetization: {
      title: "Revenue Streams",
      icon: DollarSign,
      items: [
        {
          title: "Freemium Model",
          description: "Basic matching free, premium AI insights and features paid",
          icon: Heart,
          status: "active"
        },
        {
          title: "Subscription Tiers",
          description: "Multiple levels: Basic ($10), Premium ($25), Elite ($50)",
          icon: Star,
          status: "active"
        },
        {
          title: "Transaction Fees",
          description: "Commission on successful date bookings and experiences",
          icon: DollarSign,
          status: "development"
        },
        {
          title: "Partnership Revenue",
          description: "Restaurant/venue partnerships, experience packages",
          icon: Users,
          status: "development"
        }
      ]
    }
  };

  const tabs = [
    { id: 'analytics', label: 'Analytics & ML', icon: BarChart3 },
    { id: 'security', label: 'Security & Trust', icon: Shield },
    { id: 'engagement', label: 'Engagement', icon: Zap },
    { id: 'monetization', label: 'Revenue', icon: DollarSign }
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-4"
          >
            SoulSync Production Dashboard
          </motion.h1>
          <p className="text-gray-300 text-lg">
            AI-Powered Dating Platform - Production Ready Features
          </p>
        </div>

        {/* Real-time Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-blue-400" />
              <span className="text-gray-300">Total Users</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {metrics.totalUsers.toLocaleString()}
            </div>
            <div className="text-green-400 text-sm">+12% this month</div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-6 h-6 text-pink-400" />
              <span className="text-gray-300">Active Matches</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {metrics.activeMatches.toLocaleString()}
            </div>
            <div className="text-green-400 text-sm">+8% this week</div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <span className="text-gray-300">Success Rate</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {metrics.successRate.toFixed(1)}%
            </div>
            <div className="text-green-400 text-sm">Industry leading</div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-6 h-6 text-yellow-400" />
              <span className="text-gray-300">Monthly Revenue</span>
            </div>
            <div className="text-3xl font-bold text-white">
              ${metrics.revenue.toLocaleString()}
            </div>
            <div className="text-green-400 text-sm">+24% growth</div>
          </div>
        </motion.div>

        {/* Feature Tabs */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-white/10">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-white border-b-2 border-pink-500'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <TabIcon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-6">
                {React.createElement(features[activeTab].icon, { 
                  className: "w-8 h-8 text-pink-400" 
                })}
                <h2 className="text-2xl font-bold text-white">
                  {features[activeTab].title}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features[activeTab].items.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl">
                        {React.createElement(item.icon, { 
                          className: "w-6 h-6 text-pink-400" 
                        })}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {item.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'active' 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}>
                            {item.status === 'active' ? 'Live' : 'In Development'}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 backdrop-blur-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-8 h-8 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">AI Matching Insights</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">19M+</div>
              <div className="text-gray-300">Compatibility Vectors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-400 mb-2">94.7%</div>
              <div className="text-gray-300">Match Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">2.3s</div>
              <div className="text-gray-300">Average Match Time</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductionFeatures;