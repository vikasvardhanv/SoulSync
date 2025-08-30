import { IncomingForm } from 'formidable';

// Simple working image upload endpoint for Vercel
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
    console.log('🎯 Image upload endpoint hit!');

    // Parse multipart form data
    const form = new IncomingForm({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      keepExtensions: true
    });

    const parseForm = () => new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const { files } = await parseForm();
    const imageFile = files.image;

    if (!imageFile) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
        error: { type: 'NO_FILE_ERROR' }
      });
    }

    // Read the file and convert to base64
    const fs = await import('fs');
    const fileBuffer = fs.readFileSync(imageFile.filepath);
    const base64Image = fileBuffer.toString('base64');
    const mimeType = imageFile.mimetype || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    console.log('✅ Image processed successfully:', {
      name: imageFile.originalFilename,
      size: imageFile.size,
      type: mimeType
    });

    // Return the format the frontend expects
    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageId: 'img_' + Date.now(),
        imageUrl: dataUrl,
        uploadedAt: new Date().toISOString(),
        fileInfo: {
          originalName: imageFile.originalFilename,
          size: imageFile.size,
          mimeType: mimeType
        }
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process image upload',
      error: {
        type: 'PROCESSING_ERROR',
        details: error.message
      }
    });
  }
}

// Required for Next.js API routes to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};