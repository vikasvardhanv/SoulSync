import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Set critical environment variables for Vercel deployment
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgres://41ad1dc9be4d79fa016829b50e2843b60021f1e925d0766712cf6ac359fb5658:sk_PmTdHGZVXUxVAexGZlGBm@db.prisma.io:5432/postgres?sslmode=require";
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "lcgl06w7dcq7augpesgzsy";
}

const app = express();

// Basic middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'https://soulsync.solutions'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
const uploadsDir = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SoulSync Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Root API endpoint
app.get('/', (req, res) => {
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
app.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is working correctly',
    timestamp: new Date().toISOString()
  });
});

// Initialize routes
const initializeRoutes = async () => {
  try {
    const { default: authRoutes } = await import('../backend/src/routes/auth.js');
    const { default: userRoutes } = await import('../backend/src/routes/users.js');
    const { default: questionRoutes } = await import('../backend/src/routes/questions.js');
    const { default: matchRoutes } = await import('../backend/src/routes/matches.js');
    const { default: messageRoutes } = await import('../backend/src/routes/messages.js');
    const { default: subscriptionRoutes } = await import('../backend/src/routes/subscriptions.js');
    const { default: paymentRoutes } = await import('../backend/src/routes/payments.js');
    const { default: imageRoutes } = await import('../backend/src/routes/images.js');

    // Register routes without /api prefix since Vercel handles that
    app.use('/auth', authRoutes);
    app.use('/users', userRoutes);
    app.use('/questions', questionRoutes);
    app.use('/matches', matchRoutes);
    app.use('/messages', messageRoutes);
    app.use('/subscriptions', subscriptionRoutes);
    app.use('/payments', paymentRoutes);
    app.use('/images', imageRoutes);

    console.log('✅ All routes loaded successfully');
  } catch (error) {
    console.error('❌ Error loading routes:', error);
    
    // Fallback route for when routes fail to load
    app.use('/*', (req, res) => {
      res.status(500).json({
        success: false,
        message: 'Routes not available',
        error: error.message,
        path: req.path
      });
    });
  }
};

// Initialize routes immediately
initializeRoutes();

// 404 handler for API routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.path,
    availableEndpoints: [
      '/health',
      '/test',
      '/auth',
      '/users',
      '/questions',
      '/matches',
      '/messages',
      '/subscriptions',
      '/payments',
      '/images'
    ]
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
