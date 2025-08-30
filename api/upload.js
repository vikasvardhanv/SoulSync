// Simplified and robust image upload handler for Vercel serverless
import jwt from 'jsonwebtoken';

// Simple in-memory storage for demo (in production, you'd use a proper database)
// For now, let's make it work without database complexity
const users = new Map();

// Helper function to get user from token
const getUserFromToken = async (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    // For now, return a mock user - in production this would query the database
    return {
      id: decoded.userId,
      email: 'user@example.com',
      name: 'User',
      isActive: true,
      isVerified: true
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    console.log('Upload request received');
    console.log('Headers:', req.headers);
    console.log('Body type:', typeof req.body);
    
    // Get authenticated user
    const user = await getUserFromToken(req.headers.authorization);
    if (!user) {
      console.log('Authentication failed');
      return res.status(401).json({
        success: false,
        message: 'Authentication required for image upload'
      });
    }

    console.log('User authenticated:', user.id);

    // Handle base64 image upload
    const { image, filename, mimetype } = req.body;
    
    if (!image) {
      console.log('No image data provided');
      return res.status(400).json({
        success: false,
        message: 'No image data provided'
      });
    }

    // Validate image data
    if (!image.startsWith('data:image/')) {
      console.log('Invalid image format');
      return res.status(400).json({
        success: false,
        message: 'Invalid image format. Must be base64 encoded image.'
      });
    }

    // Extract base64 data
    const base64Data = image.split(',')[1];
    const imageSize = Math.round((base64Data.length * 3) / 4); // Approximate size

    console.log('Image size:', imageSize);

    if (imageSize > 5 * 1024 * 1024) { // 5MB limit
      return res.status(400).json({
        success: false,
        message: 'Image size must be less than 5MB'
      });
    }

    // For now, just return success without database storage
    // In production, you would save to database here
    const imageId = 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    console.log('Image processed successfully:', imageId);

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageId: imageId,
        imageUrl: image, // Return the original data URL for immediate display
        filename: filename || 'uploaded-image.jpg',
        size: imageSize,
        mimetype: mimetype || 'image/jpeg',
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Image upload failed. Please try again.',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}