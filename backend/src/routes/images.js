// backend/src/routes/images.js - FIXED VERSION
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { authenticateToken } from '../middleware/auth.js';
import prisma from '../database/connection.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/ Enhanced Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'soulsync/profile-photos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    resource_type: 'auto',
    transformation: [
      { width: 800, height: 800, crop: 'fill', quality: 'auto' },
      { fetch_format: 'auto' },
    ],
  },
});

// Enhanced multer configuration with better error handling
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 6 // Max 6 files
  },
  fileFilter: (req, file, cb) => {
    console.log('Processing file:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP are allowed.`);
      error.code = 'INVALID_FILE_TYPE';
      cb(error, false);
    }
  },
});

// Enhanced upload single image with comprehensive error handling
router.post('/upload', authenticateToken, (req, res) => {
  console.log('Upload request received');
  console.log('User:', req.user?.id);
  console.log('Headers:', req.headers);

  upload.single('image')(req, res, async (err) => {
    // Handle multer errors
    if (err) {
      console.error('Multer error:', err);
      
      if (err instanceof multer.MulterError) {
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            return res.status(400).json({
              success: false,
              message: 'File size too large. Maximum 10MB allowed.',
              error: {
                type: 'FILE_SIZE_ERROR',
                maxSize: '10MB',
                suggestion: 'Please compress your image or choose a smaller file.'
              }
            });
          case 'LIMIT_FILE_COUNT':
            return res.status(400).json({
              success: false,
              message: 'Too many files. Maximum 1 file allowed.',
              error: { type: 'FILE_COUNT_ERROR' }
            });
          case 'LIMIT_UNEXPECTED_FILE':
            return res.status(400).json({
              success: false,
              message: 'Unexpected field name. Use "image" as the field name.',
              error: { type: 'FIELD_NAME_ERROR' }
            });
          default:
            return res.status(400).json({
              success: false,
              message: `Upload error: ${err.message}`,
              error: { type: 'MULTER_ERROR' }
            });
        }
      }

      // Handle custom validation errors
      if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
          success: false,
          message: err.message,
          error: {
            type: 'INVALID_FILE_TYPE',
            allowedTypes: ['JPEG', 'PNG', 'WebP'],
            suggestion: 'Please upload a valid image file.'
          }
        });
      }

      // Handle Cloudinary errors
      if (err.message && err.message.includes('cloudinary')) {
        return res.status(500).json({
          success: false,
          message: 'Image processing failed. Please try again.',
          error: {
            type: 'CLOUDINARY_ERROR',
            suggestion: 'Try compressing your image or contact support if the issue persists.'
          }
        });
      }

      // Generic error
      return res.status(500).json({
        success: false,
        message: 'Upload failed. Please try again.',
        error: { type: 'UNKNOWN_ERROR' }
      });
    }

    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided',
          error: {
            type: 'NO_FILE_ERROR',
            suggestion: 'Please select an image file to upload.'
          }
        });
      }

      const userId = req.user.id;
      const imageUrl = req.file.path;

      console.log('File uploaded to Cloudinary:', {
        originalname: req.file.originalname,
        url: imageUrl,
        size: req.file.size
      });

      // Get current user photos
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { photos: true }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          error: { type: 'USER_NOT_FOUND' }
        });
      }

      // Check photo limit (max 6 photos)
      if (user.photos.length >= 6) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 6 photos allowed',
          error: {
            type: 'PHOTO_LIMIT_EXCEEDED',
            maxPhotos: 6,
            currentCount: user.photos.length,
            suggestion: 'Delete an existing photo before uploading a new one.'
          }
        });
      }

      // Add new photo to user's photos array
      const updatedPhotos = [...user.photos, imageUrl];
      
      await prisma.user.update({
        where: { id: userId },
        data: { photos: updatedPhotos }
      });

      console.log('Photo saved to database for user:', userId);

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          imageUrl,
          totalPhotos: updatedPhotos.length,
          uploadedAt: new Date().toISOString()
        }
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      
      res.status(500).json({
        success: false,
        message: 'Failed to save image to database',
        error: {
          type: 'DATABASE_ERROR',
          suggestion: 'Please try again or contact support if the issue persists.'
        }
      });
    }
  });
});

// Test endpoint to verify API is working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Images API is working',
    timestamp: new Date().toISOString()
  });
});

// Upload multiple images (keep existing logic but add better error handling)
router.post('/upload-multiple', authenticateToken, (req, res) => {
  upload.array('images', 6)(req, res, async (err) => {
    if (err) {
      console.error('Multiple upload error:', err);
      // Use same error handling as single upload
      return handleUploadError(err, res);
    }

    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No image files provided'
        });
      }

      const userId = req.user.id;
      const imageUrls = req.files.map(file => file.path);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { photos: true }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.photos.length + imageUrls.length > 6) {
        return res.status(400).json({
          success: false,
          message: `Cannot upload ${imageUrls.length} photos. Maximum 6 photos allowed (you currently have ${user.photos.length})`
        });
      }

      const updatedPhotos = [...user.photos, ...imageUrls];
      
      await prisma.user.update({
        where: { id: userId },
        data: { photos: updatedPhotos }
      });

      res.json({
        success: true,
        message: `${imageUrls.length} images uploaded successfully`,
        data: {
          imageUrls,
          totalPhotos: updatedPhotos.length
        }
      });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save images to database'
      });
    }
  });
});

// Helper function to handle upload errors consistently
function handleUploadError(err, res) {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(413).json({
          success: false,
          message: 'File too large. Maximum 10MB allowed.',
          error: {
            type: 'FILE_SIZE_ERROR',
            maxSize: '10MB',
            suggestion: 'Please compress your image or choose a smaller file.'
          }
        });
      default:
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
    }
  }
  return res.status(500).json({
    success: false,
    message: 'Upload failed. Please try again.'
  });
}

// Keep existing delete and reorder routes...
router.delete('/delete', authenticateToken, [
  body('imageUrl').isURL().withMessage('Valid image URL required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { imageUrl } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { photos: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.photos.includes(imageUrl)) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    const updatedPhotos = user.photos.filter(photo => photo !== imageUrl);
    
    await prisma.user.update({
      where: { id: userId },
      data: { photos: updatedPhotos }
    });

    // Delete from Cloudinary
    try {
      const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(`soulsync/profile-photos/${publicId}`);
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion error:', cloudinaryError);
    }

    res.json({
      success: true,
      message: 'Photo deleted successfully',
      data: {
        totalPhotos: updatedPhotos.length
      }
    });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete photo'
    });
  }
});

router.put('/reorder', authenticateToken, [
  body('photoUrls').isArray().withMessage('Photo URLs array required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { photoUrls } = req.body;

    if (!photoUrls || photoUrls.length === 0) {
      return res.json({
        success: true,
        message: 'No photos to reorder',
        data: { photos: [] }
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { photos: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const invalidUrls = photoUrls.filter(url => !user.photos.includes(url));
    if (invalidUrls.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some photo URLs do not belong to this user',
        invalidUrls
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { photos: photoUrls }
    });

    res.json({
      success: true,
      message: 'Photo order updated successfully',
      data: { photos: photoUrls }
    });
  } catch (error) {
    console.error('Reorder photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder photos'
    });
  }
});

export default router;