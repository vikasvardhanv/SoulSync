import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Basic middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'https://soulsync.solutions'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SoulSync Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Root API endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'SoulSync API is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      questions: '/api/questions',
      matches: '/api/matches',
      messages: '/api/messages',
      subscriptions: '/api/subscriptions',
      payments: '/api/payments',
      images: '/api/images'
    }
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is working correctly',
    timestamp: new Date().toISOString()
  });
});

// Initialize routes
const initializeRoutes = async () => {
  try {
    const authRoutes = await import('../backend/src/routes/auth.js');
    const userRoutes = await import('../backend/src/routes/users.js');
    const questionRoutes = await import('../backend/src/routes/questions.js');
    const matchRoutes = await import('../backend/src/routes/matches.js');
    const messageRoutes = await import('../backend/src/routes/messages.js');
    const subscriptionRoutes = await import('../backend/src/routes/subscriptions.js');
    const paymentRoutes = await import('../backend/src/routes/payments.js');
    const imageRoutes = await import('../backend/src/routes/images.js');

    // Register routes
    app.use('/api/auth', authRoutes.default);
    app.use('/api/users', userRoutes.default);
    app.use('/api/questions', questionRoutes.default);
    app.use('/api/matches', matchRoutes.default);
    app.use('/api/messages', messageRoutes.default);
    app.use('/api/subscriptions', subscriptionRoutes.default);
    app.use('/api/payments', paymentRoutes.default);
    app.use('/api/images', imageRoutes.default);

    console.log('✅ All routes loaded successfully');
  } catch (error) {
    console.error('❌ Error loading routes:', error);
    
    // Fallback route for when routes fail to load
    app.use('/api/*', (req, res) => {
      res.status(500).json({
        success: false,
        message: 'Routes not available',
        error: error.message
      });
    });
  }
};

// Initialize routes immediately
initializeRoutes();

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.path
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Export for Vercel
export default app;
