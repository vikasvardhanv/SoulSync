// Simple test endpoint for image upload debugging
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('Test upload endpoint hit');
    console.log('Method:', req.method);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body type:', typeof req.body);
    console.log('Body keys:', req.body ? Object.keys(req.body) : 'No body');

    return res.status(200).json({
      success: true,
      message: 'Test upload endpoint working',
      debug: {
        method: req.method,
        hasBody: !!req.body,
        bodyType: typeof req.body,
        bodyKeys: req.body ? Object.keys(req.body) : null,
        hasAuth: !!req.headers.authorization,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Test upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Test upload failed',
      error: error.message,
      stack: error.stack
    });
  }
}