# SoulSync Deployment Guide

## 🚀 Quick Deploy to Vercel

### Prerequisites
- Node.js 18+ installed
- Vercel CLI installed: `npm i -g vercel`
- Git repository with your code

### Step 1: Prepare Your Environment

1. **Install dependencies:**
```bash
npm run install:all
```

2. **Build the frontend:**
```bash
npm run build:frontend
```

3. **Verify build output:**
```bash
ls -la dist/
```

### Step 2: Deploy to Vercel

1. **Login to Vercel:**
```bash
vercel login
```

2. **Deploy:**
```bash
vercel --prod
```

3. **Follow the prompts:**
   - Link to existing project or create new
   - Confirm deployment settings

### Step 3: Configure Environment Variables

In your Vercel dashboard, go to Settings → Environment Variables and add:

```env
# Database
DATABASE_URL=your_postgresql_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (SMTP)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=noreply@soulsync.solutions

# CORS
CORS_ORIGIN=https://your-vercel-domain.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Environment
NODE_ENV=production
```

### Step 4: Test Your Deployment

1. **Get your deployment URL from Vercel dashboard**

2. **Test the endpoints:**
```bash
# Test frontend
curl https://your-domain.vercel.app/

# Test API health
curl https://your-domain.vercel.app/api/health

# Test API root
curl https://your-domain.vercel.app/api
```

3. **Run the test script:**
```bash
DEPLOYMENT_URL=https://your-domain.vercel.app node test-deployment.js
```

## 🔧 Troubleshooting 404 Errors

### Common Issues & Solutions

#### 1. **Wrong Deployment URL**
- Check your Vercel dashboard for the correct URL
- The URL might be `https://soulsync-xxxxx.vercel.app` instead of `https://soulsync.solutions`

#### 2. **Build Issues**
```bash
# Check if dist folder exists
ls -la dist/

# Rebuild if needed
npm run build:frontend
```

#### 3. **Environment Variables Missing**
- Ensure all required environment variables are set in Vercel
- Check Vercel deployment logs for missing variable errors

#### 4. **Database Connection Issues**
- Verify your `DATABASE_URL` is correct
- Ensure your database is accessible from Vercel's servers

#### 5. **CORS Issues**
- Set `CORS_ORIGIN` to your actual Vercel domain
- Include both `http://localhost:3000` and your production domain

### Debugging Steps

1. **Check Vercel Logs:**
   - Go to Vercel dashboard → Your project → Functions
   - Look for any error messages

2. **Test API Endpoints:**
```bash
# Test health endpoint
curl https://your-domain.vercel.app/api/health

# Test with verbose output
curl -v https://your-domain.vercel.app/api/health
```

3. **Check Build Output:**
```bash
# Verify frontend build
ls -la dist/
cat dist/index.html
```

4. **Test Local Build:**
```bash
# Build locally
npm run build:frontend

# Serve locally to test
npx serve dist/
```

## 📁 Project Structure

```
soulsync/
├── frontend/          # React frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── backend/           # Express backend
│   ├── src/
│   ├── prisma/
│   └── package.json
├── api/              # Vercel serverless API
│   └── index.js
├── dist/             # Built frontend (generated)
├── vercel.json       # Vercel configuration
├── package.json      # Root package.json
└── test-deployment.js # Deployment test script
```

## 🔄 Redeployment

To redeploy after changes:

```bash
# Make your changes
git add .
git commit -m "Fix deployment issues"
git push

# Or deploy manually
vercel --prod
```

## 🎯 Success Indicators

Your deployment is working when:

- ✅ `https://your-domain.vercel.app/` loads the homepage
- ✅ `https://your-domain.vercel.app/api/health` returns JSON
- ✅ `https://your-domain.vercel.app/api` shows API info
- ✅ No console errors in browser
- ✅ User registration/login works
- ✅ File uploads work

## 🆘 Getting Help

If you're still having issues:

1. **Check Vercel Status:** [vercel-status.com](https://vercel-status.com)
2. **Review Logs:** Vercel dashboard → Functions → Logs
3. **Test Locally:** `npm run dev` to ensure code works locally
4. **Contact Support:** Use Vercel's support if needed

## 🚀 Advanced Configuration

### Custom Domain Setup

1. Go to Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Set `CORS_ORIGIN` to include your custom domain

### Database Setup

1. **PostgreSQL Database:**
   - Use services like Supabase, Railway, or Neon
   - Get connection string
   - Set as `DATABASE_URL` in Vercel

2. **Run Migrations:**
```bash
# Locally
cd backend
npm run db:push

# Or use Prisma Studio
npm run db:studio
```

### Email Configuration

1. **SMTP Setup:**
   - Use services like SendGrid, Mailgun, or Gmail
   - Configure SMTP settings in Vercel environment variables

2. **Test Email:**
```bash
# Test email functionality
curl -X POST https://your-domain.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

---

**Need more help?** Check the troubleshooting guides in the repository or contact the development team.
