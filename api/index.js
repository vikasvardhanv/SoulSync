// Use dynamic import for ES modules
let app;
let appPromise;

export default async function handler(request, response) {
  // Lazy load the app on first request
  if (!app && !appPromise) {
    // Start loading the app
    appPromise = import('../backend/src/server.js').then(module => {
      app = module.default;
      return app;
    }).catch(error => {
      console.error('Failed to import Express app:', error);
      throw error;
    });
  }
  
  // If app is still loading, wait for it
  if (!app && appPromise) {
    try {
      app = await appPromise;
      appPromise = null;
    } catch (error) {
      response.status(500).json({ 
        error: 'Failed to load application', 
        message: 'Could not import Express app',
        details: error.message
      });
      return;
    }
  }
  
  // Pass the request and response to our Express app
  return app(request, response);
}
