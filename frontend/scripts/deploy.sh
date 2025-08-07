#!/bin/bash

# SoulSync Production Deployment Script

echo "🚀 Starting SoulSync production deployment..."

# Check if environment variables are set
if [ -z "$VITE_API_URL" ] || [ -z "$VITE_PAYPAL_CLIENT_ID" ]; then
    echo "❌ Error: Required environment variables are not set"
    echo "Please set: VITE_API_URL, VITE_PAYPAL_CLIENT_ID"
    echo ""
    echo "Example:"
    echo "VITE_API_URL=https://your-backend-domain.vercel.app/api"
    echo "VITE_PAYPAL_CLIENT_ID=your-paypal-client-id"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Run type checking
echo "🔍 Running type checking..."
npm run type-check

# Run linting
echo "🧹 Running linting..."
npm run lint

# Build the project
echo "🏗️ Building for production..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Production files are in the 'dist' directory"
    
    # Optional: Deploy to specific platform
    if [ "$DEPLOY_PLATFORM" = "vercel" ]; then
        echo "🚀 Deploying to Vercel..."
        npx vercel --prod
    elif [ "$DEPLOY_PLATFORM" = "netlify" ]; then
        echo "🚀 Deploying to Netlify..."
        npx netlify deploy --prod --dir=dist
    else
        echo "📋 Manual deployment instructions:"
        echo "1. Upload the 'dist' folder to your web server"
        echo "2. Configure your web server to serve static files"
        echo "3. Set up environment variables on your server:"
        echo "   - VITE_API_URL: Your backend API URL"
        echo "   - VITE_PAYPAL_CLIENT_ID: Your PayPal client ID"
    fi
else
    echo "❌ Build failed!"
    exit 1
fi

echo "🎉 Deployment script completed!" 