// backend/src/server.js - Enhanced error handling
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Load environment variables first
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

const app = express();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'https://soulsync.solutions'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SoulSync Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes - Import routes dynamically to handle errors
const initializeRoutes = async () => {
  try {
    console.log('🔄 Initializing API routes...');
    
    // Import routes
    const authRoutes = await import('./routes/auth.js');
    const userRoutes = await import('./routes/users.js');
    const questionRoutes = await import('./routes/questions.js');
    const matchRoutes = await import('./routes/matches.js');
    const messageRoutes = await import('./routes/messages.js');
    const subscriptionRoutes = await import('./routes/subscriptions.js');
    const paymentRoutes = await import('./routes/payments.js');
    const imageRoutes = await import('./routes/images.js');

    // Register routes
    app.use('/api/auth', authRoutes.default);
    app.use('/api/users', userRoutes.default);
    app.use('/api/questions', questionRoutes.default);
    app.use('/api/matches', matchRoutes.default);
    app.use('/api/messages', messageRoutes.default);
    app.use('/api/subscriptions', subscriptionRoutes.default);
    app.use('/api/payments', paymentRoutes.default);
    app.use('/api/images', imageRoutes.default);

    console.log('✅ API routes initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize routes:', error);
    throw error;
  }
};

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Initialize routes
    await initializeRoutes();
    
    // Start listening
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'localhost:3000'}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();

export default app;