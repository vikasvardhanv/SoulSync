// Simple working login endpoint for Vercel
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://soulsync.solutions');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Use POST.'
    });
  }

  try {
    console.log('🎯 Login endpoint hit!');
    
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        error: { type: 'VALIDATION_ERROR' }
      });
    }

    // For now, accept any credentials for demo
    // In a real implementation, you would verify against database
    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: {
        user: {
          id: 'user_' + Date.now(),
          email: email,
          name: 'Demo User',
          isVerified: true,
          photos: [] // Empty photos array initially
        },
        token: 'demo_token_' + Date.now()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: {
        type: 'SERVER_ERROR',
        details: error.message
      }
    });
  }
}