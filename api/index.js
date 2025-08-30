// Vercel serverless function - Robust implementation with better error handling
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Initialize Prisma client only when needed
let prisma = null;

const initPrisma = async () => {
  if (!prisma) {
    try {
      const { PrismaClient } = await import('@prisma/client');
      prisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL || process.env.PRISMA_DATABASE_URL
          }
        }
      });
      await prisma.$connect();
    } catch (error) {
      console.error('Prisma initialization error:', error);
      throw error;
    }
  }
  return prisma;
};

// Helper function to get user from token
const getUserFromToken = async (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    const db = await initPrisma();
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        isVerified: true
      }
    });
    
    return user && user.isActive ? user : null;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url, method } = req;
  
  try {
    // Health check with database connection test
    if (url === '/api/health' || url === '/health') {
      try {
        const db = await initPrisma();
        await db.$queryRaw`SELECT 1`;
        return res.status(200).json({
          status: 'OK',
          message: 'SoulSync API is running',
          database: 'Connected',
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'production',
          version: '1.0.0'
        });
      } catch (error) {
        console.error('Health check error:', error);
        return res.status(500).json({
          status: 'ERROR',
          message: 'Database connection failed',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Test endpoint
    if (url === '/api/test') {
      return res.status(200).json({
        success: true,
        message: 'API test successful',
        timestamp: new Date().toISOString(),
        method,
        url
      });
    }

    // Auth Registration endpoint
    if (url === '/api/auth/register' && method === 'POST') {
      try {
        const body = req.body;
        
        // Basic validation
        if (!body.email || !body.password || !body.name || !body.age) {
          return res.status(400).json({
            success: false,
            message: 'Missing required fields',
            errors: [
              { path: 'email', msg: 'Email is required' },
              { path: 'password', msg: 'Password is required' },
              { path: 'name', msg: 'Name is required' },
              { path: 'age', msg: 'Age is required' }
            ]
          });
        }

        const db = await initPrisma();

        // Check if user already exists
        const existingUser = await db.user.findUnique({
          where: { email: body.email.toLowerCase() }
        });

        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: 'An account with this email already exists',
            action: {
              type: 'existing_user',
              message: 'You can sign in with your existing account or reset your password if forgotten',
              links: {
                login: '/login',
                forgot_password: '/forgot-password'
              }
            }
          });
        }

        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(body.password, saltRounds);

        // Process optional arrays
        const processedInterests = Array.isArray(body.interests) 
          ? body.interests.filter(interest => interest && typeof interest === 'string' && interest.trim().length > 0)
          : [];
        
        const processedPhotos = Array.isArray(body.photos) 
          ? body.photos.filter(photo => photo && typeof photo === 'string' && photo.trim().length > 0)
          : [];

        // Create user in database
        const user = await db.user.create({
          data: {
            email: body.email.toLowerCase(),
            password: passwordHash,
            name: body.name.trim(),
            age: parseInt(body.age),
            bio: body.bio?.trim() || null,
            location: body.location?.trim() || null,
            interests: processedInterests,
            photos: processedPhotos,
            isVerified: false,
            isActive: true
          },
          select: {
            id: true,
            email: true,
            name: true,
            age: true,
            bio: true,
            location: true,
            interests: true,
            photos: true,
            isVerified: true,
            isActive: true,
            createdAt: true
          }
        });

        // Generate JWT tokens
        const accessToken = jwt.sign(
          { userId: user.id },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '7d' }
        );

        const refreshToken = jwt.sign(
          { userId: user.id },
          process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '30d' }
        );

        // Save refresh token to database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await db.refreshToken.create({
          data: {
            userId: user.id,
            token: refreshToken,
            expiresAt
          }
        });

        return res.status(201).json({
          success: true,
          message: 'Account created successfully! Please check your email to verify your account.',
          data: {
            user,
            tokens: {
              accessToken,
              refreshToken
            },
            nextStep: {
              type: 'email_verification',
              message: 'Check your email and click the verification link to fully activate your account',
              resend_link: '/auth/resend-verification'
            }
          }
        });

      } catch (error) {
        console.error('Registration error:', error);
        
        if (error.code === 'P2002') {
          return res.status(409).json({
            success: false,
            message: 'An account with this email already exists'
          });
        }
        
        return res.status(500).json({
          success: false,
          message: 'Registration failed. Please try again.',
          error: error.message
        });
      }
    }

    // Auth Login endpoint
    if (url === '/api/auth/login' && method === 'POST') {
      try {
        const body = req.body;
        
        if (!body.email || !body.password) {
          return res.status(400).json({
            success: false,
            message: 'Email and password are required',
            errors: [
              { path: 'email', msg: 'Email is required' },
              { path: 'password', msg: 'Password is required' }
            ]
          });
        }

        const db = await initPrisma();

        // Get user with password
        const user = await db.user.findUnique({
          where: { email: body.email.toLowerCase() },
          select: {
            id: true,
            email: true,
            password: true,
            name: true,
            age: true,
            bio: true,
            location: true,
            interests: true,
            photos: true,
            isVerified: true,
            isActive: true
          }
        });

        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'Invalid email or password',
            action: {
              type: 'account_not_found',
              message: 'No account found with this email. Would you like to create one?',
              links: {
                register: '/signup',
                forgot_password: '/forgot-password'
              }
            }
          });
        }

        if (!user.isActive) {
          return res.status(401).json({
            success: false,
            message: 'Your account has been deactivated. Please contact support.'
          });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(body.password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({
            success: false,
            message: 'Invalid email or password',
            action: {
              type: 'wrong_password',
              message: 'Forgot your password?',
              links: {
                forgot_password: '/forgot-password'
              }
            }
          });
        }

        // Generate tokens
        const accessToken = jwt.sign(
          { userId: user.id },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '7d' }
        );

        const refreshToken = jwt.sign(
          { userId: user.id },
          process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '30d' }
        );

        // Save refresh token
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await db.refreshToken.create({
          data: {
            userId: user.id,
            token: refreshToken,
            expiresAt
          }
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        const response = {
          success: true,
          message: 'Welcome back! Login successful.',
          data: {
            user: userWithoutPassword,
            tokens: {
              accessToken,
              refreshToken
            }
          }
        };

        // Add verification reminder if not verified
        if (!user.isVerified) {
          response.reminder = {
            type: 'email_verification',
            message: 'Please verify your email address to unlock all features',
            action: 'resend_verification'
          };
        }

        return res.status(200).json(response);

      } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
          success: false,
          message: 'Login failed. Please try again.',
          error: error.message
        });
      }
    }

    // Auth Me endpoint
    if (url === '/api/auth/me' && method === 'GET') {
      try {
        const user = await getUserFromToken(req.headers.authorization);
        
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
          });
        }

        const db = await initPrisma();
        const fullUser = await db.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            email: true,
            name: true,
            age: true,
            bio: true,
            location: true,
            interests: true,
            photos: true,
            isVerified: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          }
        });

        const response = {
          success: true,
          data: { user: fullUser }
        };

        // Add verification reminder if not verified
        if (!fullUser.isVerified) {
          response.reminder = {
            type: 'email_verification',
            message: 'Please verify your email address to unlock all features',
            action: '/auth/resend-verification'
          };
        }

        return res.status(200).json(response);

      } catch (error) {
        console.error('Get user error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to get user data',
          error: error.message
        });
      }
    }

    // Get potential matches endpoint
    if (url === '/api/users/potential-matches' && method === 'GET') {
      try {
        // Get current user if authenticated
        let currentUserId = null;
        const user = await getUserFromToken(req.headers.authorization);
        if (user) {
          currentUserId = user.id;
        }

        const db = await initPrisma();
        const matches = await db.user.findMany({
          where: {
            isActive: true,
            isVerified: true,
            ...(currentUserId && { id: { not: currentUserId } })
          },
          select: {
            id: true,
            name: true,
            age: true,
            bio: true,
            location: true,
            interests: true,
            photos: true,
            createdAt: true
          },
          take: 20,
          orderBy: {
            createdAt: 'desc'
          }
        });

        return res.status(200).json({
          success: true,
          data: {
            matches,
            totalCount: matches.length
          }
        });

      } catch (error) {
        console.error('Get matches error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch potential matches',
          error: error.message
        });
      }
    }

    // AI Compatibility Analysis endpoint
    if (url === '/api/ai/analyze-compatibility' && method === 'POST') {
      try {
        const { prompt } = req.body;
        
        // Mock AI analysis with realistic compatibility scoring
        const mockAnalysis = {
          score: Math.round((7 + Math.random() * 3) * 10) / 10, // Score between 7.0-10.0
          reasoning: "You both value deep connections and personal growth. Your communication styles complement each other well - you're both thoughtful listeners who appreciate meaningful conversations. While you have different energy levels for social activities, this creates a nice balance where you can enjoy both quiet intimate moments and more social adventures together.",
          conversation_starters: [
            "I noticed you love reading - what's the last book that completely changed your perspective?",
            "Your travel photos are amazing! What's been your most transformative travel experience?",
            "I see we both value personal growth - what's something you've learned about yourself recently?"
          ]
        };

        return res.status(200).json({
          success: true,
          data: mockAnalysis
        });

      } catch (error) {
        console.error('AI analysis error:', error);
        return res.status(500).json({
          success: false,
          message: 'AI analysis failed',
          error: error.message
        });
      }
    }

    // Images test endpoint
    if (url.startsWith('/api/images/test')) {
      return res.status(200).json({
        success: true,
        message: 'Images API test endpoint working',
        timestamp: new Date().toISOString(),
        config: {
          maxFileSize: '5MB',
          allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
          storageType: 'database',
          authentication: 'required'
        }
      });
    }

    // Generic auth endpoints
    if (url.startsWith('/api/auth/')) {
      return res.status(200).json({
        success: true,
        message: 'Auth endpoint reached',
        endpoint: url,
        method,
        timestamp: new Date().toISOString(),
        note: 'This endpoint is not fully implemented yet'
      });
    }

    // Users endpoints
    if (url.startsWith('/api/users/')) {
      return res.status(200).json({
        success: true,
        message: 'Users endpoint reached',
        endpoint: url,
        method,
        timestamp: new Date().toISOString(),
        note: 'This endpoint is not fully implemented yet'
      });
    }

    // Default response for unhandled routes
    return res.status(404).json({
      success: false,
      message: 'API endpoint not found',
      path: url,
      method,
      timestamp: new Date().toISOString(),
      availableEndpoints: [
        'GET /api/health',
        'GET /api/test',
        'POST /api/auth/register',
        'POST /api/auth/login',
        'GET /api/auth/me',
        'GET /api/users/potential-matches',
        'POST /api/ai/analyze-compatibility',
        'GET /api/images/test',
        'POST /api/images/upload (separate endpoint)',
        'ALL /api/auth/*',
        'ALL /api/users/*'
      ]
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}