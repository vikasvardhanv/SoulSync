// Production-ready image upload handler for Vercel serverless
import jwt from 'jsonwebtoken';

// Initialize Prisma client
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

// Production helper function to get authenticated user
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
        isVerified: true,
        photos: true
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // GET: Retrieve user's photos
    if (req.method === 'GET') {
      const user = await getUserFromToken(req.headers.authorization);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const db = await initPrisma();
      const userImages = await db.image.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          filename: true,
          mimetype: true,
          size: true,
          data: true,
          createdAt: true
        },
        orderBy: { createdAt: 'asc' }
      });

      const photos = userImages.map(img => ({
        id: img.id,
        url: `data:${img.mimetype};base64,${img.data}`,
        filename: img.filename,
        size: img.size,
        uploadedAt: img.createdAt
      }));

      return res.status(200).json({
        success: true,
        data: {
          photos,
          totalCount: photos.length,
          maxPhotos: 6
        }
      });
    }

    // POST: Upload new photo
    if (req.method === 'POST') {
      const user = await getUserFromToken(req.headers.authorization);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required for image upload',
          error: {
            code: 'UNAUTHORIZED',
            suggestion: 'Please log in and try again'
          }
        });
      }

      // Check photo limit
      if (user.photos.length >= 6) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 6 photos allowed per profile',
          error: {
            code: 'PHOTO_LIMIT_EXCEEDED',
            currentCount: user.photos.length,
            maxPhotos: 6,
            suggestion: 'Delete an existing photo before uploading a new one'
          }
        });
      }

      const { image, filename, mimetype } = req.body;
      
      if (!image) {
        return res.status(400).json({
          success: false,
          message: 'No image data provided',
          error: {
            code: 'MISSING_IMAGE_DATA',
            suggestion: 'Include base64 encoded image data in request body'
          }
        });
      }

      // Validate image format
      if (!image.startsWith('data:image/')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid image format. Must be base64 encoded image.',
          error: {
            code: 'INVALID_FORMAT',
            allowedFormats: ['JPEG', 'PNG', 'WebP'],
            suggestion: 'Upload a valid image file'
          }
        });
      }

      // Extract and validate image data
      const mimeMatch = image.match(/^data:(image\/[^;]+);base64,(.+)$/);
      if (!mimeMatch) {
        return res.status(400).json({
          success: false,
          message: 'Invalid image data format',
          error: {
            code: 'MALFORMED_DATA_URL',
            suggestion: 'Ensure image is properly base64 encoded'
          }
        });
      }

      const detectedMimetype = mimeMatch[1];
      const base64Data = mimeMatch[2];
      const imageSize = Math.round((base64Data.length * 3) / 4);

      // Validate file size (5MB limit)
      if (imageSize > 5 * 1024 * 1024) {
        return res.status(413).json({
          success: false,
          message: 'Image size exceeds 5MB limit',
          error: {
            code: 'FILE_TOO_LARGE',
            size: imageSize,
            maxSize: 5 * 1024 * 1024,
            suggestion: 'Compress your image or choose a smaller file'
          }
        });
      }

      // Validate MIME type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(detectedMimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Unsupported image format',
          error: {
            code: 'UNSUPPORTED_FORMAT',
            detectedType: detectedMimetype,
            allowedTypes: allowedTypes,
            suggestion: 'Convert to JPEG, PNG, or WebP format'
          }
        });
      }

      const db = await initPrisma();

      // Save image to database
      const savedImage = await db.image.create({
        data: {
          filename: filename || 'uploaded-image.jpg',
          mimetype: detectedMimetype,
          size: imageSize,
          data: base64Data,
          userId: user.id
        },
        select: {
          id: true,
          filename: true,
          mimetype: true,
          size: true,
          createdAt: true
        }
      });

      // Update user's photos array
      const updatedPhotos = [...user.photos, savedImage.id];
      await db.user.update({
        where: { id: user.id },
        data: { photos: updatedPhotos }
      });

      return res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          imageId: savedImage.id,
          imageUrl: `data:${savedImage.mimetype};base64,${base64Data}`,
          filename: savedImage.filename,
          size: savedImage.size,
          mimetype: savedImage.mimetype,
          uploadedAt: savedImage.createdAt,
          totalPhotos: updatedPhotos.length,
          remainingSlots: 6 - updatedPhotos.length
        }
      });
    }

    // DELETE: Remove photo
    if (req.method === 'DELETE') {
      const user = await getUserFromToken(req.headers.authorization);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const { imageId } = req.body;
      if (!imageId) {
        return res.status(400).json({
          success: false,
          message: 'Image ID required',
          error: {
            code: 'MISSING_IMAGE_ID',
            suggestion: 'Include imageId in request body'
          }
        });
      }

      if (!user.photos.includes(imageId)) {
        return res.status(404).json({
          success: false,
          message: 'Photo not found in your profile',
          error: {
            code: 'PHOTO_NOT_FOUND',
            suggestion: 'Check that the image ID belongs to your profile'
          }
        });
      }

      const db = await initPrisma();

      // Remove from user's photos array
      const updatedPhotos = user.photos.filter(id => id !== imageId);
      await db.user.update({
        where: { id: user.id },
        data: { photos: updatedPhotos }
      });

      // Delete image from database
      await db.image.delete({
        where: { id: imageId }
      });

      return res.status(200).json({
        success: true,
        message: 'Photo deleted successfully',
        data: {
          deletedImageId: imageId,
          totalPhotos: updatedPhotos.length,
          remainingSlots: 6 - updatedPhotos.length
        }
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      allowedMethods: ['GET', 'POST', 'DELETE']
    });

  } catch (error) {
    console.error('Image API error:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Database conflict - please try again',
        error: {
          code: 'DATABASE_CONFLICT',
          suggestion: 'Try the request again'
        }
      });
    }

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
        error: {
          code: 'NOT_FOUND',
          suggestion: 'Check that the resource exists'
        }
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
      error: {
        code: 'INTERNAL_ERROR',
        suggestion: 'Try again or contact support if the issue persists'
      },
      ...(process.env.NODE_ENV === 'development' && { 
        details: error.message,
        stack: error.stack 
      })
    });
  }
}