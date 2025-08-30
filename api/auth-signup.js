// Simple working signup endpoint for Vercel
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
    console.log('🎯 Signup endpoint hit!');
    
    const { email, password, name } = req.body;

    // Basic validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required',
        error: { type: 'VALIDATION_ERROR' }
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
        error: { type: 'VALIDATION_ERROR' }
      });
    }

    // For now, return a successful response
    // In a real implementation, you would save to database
    return res.status(200).json({
      success: true,
      message: 'Account created successfully!',
      data: {
        user: {
          id: 'user_' + Date.now(),
          email: email,
          name: name,
          isVerified: false
        },
        token: 'demo_token_' + Date.now()
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create account',
      error: {
        type: 'SERVER_ERROR',
        details: error.message
      }
    });
  }
}