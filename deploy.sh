#!/bin/bash

# SoulSync Deployment Script
# This script helps deploy the application to Vercel

set -e  # Exit on any error

echo "🚀 SoulSync Deployment Script"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "vercel.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Step 1: Check Node.js version
print_status "Checking Node.js version..."
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 18+ is required. Current version: $(node --version)"
    exit 1
fi
print_success "Node.js version: $(node --version)"

# Step 2: Check if Vercel CLI is installed
print_status "Checking Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Attempting to install..."
    
    # Try different installation methods
    if npm install -g vercel 2>/dev/null; then
        print_success "Vercel CLI installed globally"
    else
        print_warning "Global installation failed. Trying alternative methods..."
        
        # Method 1: Install locally in the project
        print_status "Installing Vercel CLI locally..."
        npm install vercel --save-dev
        
        # Create a local vercel command
        if [ -f "node_modules/.bin/vercel" ]; then
            print_success "Vercel CLI installed locally"
            # Use local vercel for the rest of the script
            VERCEL_CMD="./node_modules/.bin/vercel"
        else
            print_error "Failed to install Vercel CLI. Please install manually:"
            echo "   Option 1: sudo npm install -g vercel"
            echo "   Option 2: npm install vercel --save-dev"
            echo "   Option 3: npx vercel (uses npx to run without installation)"
            exit 1
        fi
    fi
else
    VERCEL_CMD="vercel"
    print_success "Vercel CLI is available"
fi

# Step 3: Install dependencies
print_status "Installing dependencies..."
npm run install:all
print_success "Dependencies installed"

# Step 4: Build frontend
print_status "Building frontend..."
npm run build:frontend
print_success "Frontend built successfully"

# Step 5: Check build output
print_status "Checking build output..."
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    print_error "Build output not found. Check the build process."
    exit 1
fi
print_success "Build output verified"

# Step 6: Check if user is logged into Vercel
print_status "Checking Vercel login status..."
if ! $VERCEL_CMD whoami &> /dev/null; then
    print_warning "Not logged into Vercel. Please login..."
    $VERCEL_CMD login
fi
print_success "Logged into Vercel"

# Step 7: Deploy to Vercel
print_status "Deploying to Vercel..."
$VERCEL_CMD --prod

print_success "Deployment completed!"
echo ""
echo "🎯 Next steps:"
echo "1. Check your Vercel dashboard for the deployment URL"
echo "2. Configure environment variables in Vercel dashboard"
echo "3. Test the deployment with: node test-deployment.js"
echo "4. Set up your custom domain if needed"
echo ""
echo "📋 Required environment variables:"
echo "   - DATABASE_URL"
echo "   - JWT_SECRET"
echo "   - CLOUDINARY_CLOUD_NAME"
echo "   - CLOUDINARY_API_KEY"
echo "   - CLOUDINARY_API_SECRET"
echo "   - CORS_ORIGIN"
echo ""
echo "🔗 Useful links:"
echo "   - Vercel Dashboard: https://vercel.com/dashboard"
echo "   - Deployment Guide: DEPLOYMENT.md"
echo "   - Troubleshooting: TROUBLESHOOTING-404.md"
