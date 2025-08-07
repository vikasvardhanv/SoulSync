import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { existsSync } from 'fs';

// Load environment variables
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

// Resolve __dirname for ES modules
const __dirname = path.resolve();
const staticPath = path.join(__dirname, '../frontend/dist');

// Verify static path exists
if (!existsSync(staticPath)) {
  console.error(`❌ Static path does not exist: ${staticPath}`);
} else {
  console.log(`✅ Serving static files from: ${staticPath}`);
}

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:", "https://res.cloudinary.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://api.soulsync.solutions", "https://*.cloudinary.com", process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000']
    },
  },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'https://soulsync.solutions', process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ''],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// Rate limiting for API routes
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

// Serve static frontend files
app.use('/', express.static(staticPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// API routes - Import routes dynamically
const initializeRoutes = async () => {
  try {
    console.log('🔄 Initializing API routes...');
    
    const authRoutes = await import('./routes/auth.js');
    const userRoutes = await import('./routes/users.js');
    const questionRoutes = await import('./routes/questions.js');
    const matchRoutes = await import('./routes/matches.js');
    const messageRoutes = await import('./routes/messages.js');
    const subscriptionRoutes = await import('./routes/subscriptions.js');
    const paymentRoutes = await import('./routes/payments.js');
    const imageRoutes = await import('./routes/images.js');

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

// SPA routing: Serve index.html for non-API, non-static routes
app.get(/^(?!\/api\/|\/health|\/assets\/).*/, (req, res) => {
  console.log(`Serving index.html for path: ${req.path}`);
  res.sendFile(path.join(staticPath, 'index.html'));
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Initialize routes
initializeRoutes()
  .then(() => {
    // Start the server
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`✅ SoulSync Backend server running on port ${PORT}`);
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
      console.log(`🎉 API Base URL: http://localhost:${PORT}/api`);
    });
  })
  .catch(error => {
    console.error('❌ Failed to initialize server:', error);
    process.exit(1);
  });

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;