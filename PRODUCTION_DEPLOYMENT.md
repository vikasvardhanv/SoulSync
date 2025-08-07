# SoulSync Production Deployment Guide

## Environment Setup ✅

### Required Environment Variables
Set these in your Vercel dashboard:

```env
DATABASE_URL="postgresql://username:password@host:5432/database"
JWT_SECRET="secure-32-character-minimum-secret-key"
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
CORS_ORIGIN="https://your-domain.vercel.app"
NODE_ENV="production"
```

## Database Configuration ✅

### PostgreSQL Setup
- Use Vercel Postgres or external PostgreSQL provider
- Ensure connection pooling is enabled
- Set `DATABASE_URL` environment variable
- Schema uses multi-schema setup (soulsync, public)

### Migration Commands
```bash
# Deploy migrations to production
npm run migrate:deploy

# Generate Prisma client
npm run prisma:generate
```

## Vercel Configuration ✅

### vercel.json Settings
- Node.js 20.x runtime
- Proper API routing to `/api/index.js`
- Static file serving from `frontend/dist`
- Build commands optimized for monorepo

### Build Process
```bash
# Frontend build
npm run build-frontend

# Backend build (Prisma generation)
npm run build-backend
```

## API Endpoints Status ✅

### Available Routes
- `/api/health` - Health check
- `/api/auth/*` - Authentication
- `/api/users/*` - User management
- `/api/images/*` - Image upload (Cloudinary)
- `/api/matches/*` - Matching system
- `/api/messages/*` - Messaging
- `/api/payments/*` - Payment processing
- `/api/subscriptions/*` - Subscription management
- `/api/questions/*` - Compatibility questions

## Security Features ✅

### Implemented Security
- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests/15min)
- JWT authentication
- Input validation
- File upload restrictions
- SQL injection protection (Prisma)

## Performance Optimizations ✅

### Frontend
- Code splitting
- Asset optimization
- Lazy loading
- Image compression

### Backend
- Connection pooling
- Query optimization
- Serverless-friendly Prisma setup
- Compression middleware

## Image Upload System ✅

### Cloudinary Integration
- 10MB file size limit
- Automatic image optimization
- Multiple format support (JPEG, PNG, WebP)
- Folder organization
- CDN delivery

## Payment System ✅

### Supported Providers
- NOWPayments (crypto)
- PayPal integration ready
- Subscription management
- Payment history tracking

## Deployment Steps

### 1. Environment Setup
1. Create Vercel project
2. Connect GitHub repository
3. Set environment variables
4. Configure custom domain (optional)

### 2. Database Setup
1. Create PostgreSQL database
2. Set `DATABASE_URL`
3. Run migrations: `npm run migrate:deploy`

### 3. Third-party Services
1. Configure Cloudinary account
2. Set up payment providers
3. Configure email service (optional)

### 4. Deploy
```bash
# Using Vercel CLI
vercel --prod

# Or push to main branch for automatic deployment
git push origin main
```

## Post-Deployment Checklist

- [ ] All environment variables set
- [ ] Database migrations deployed
- [ ] API endpoints responding
- [ ] Image upload working
- [ ] Authentication flow tested
- [ ] CORS properly configured
- [ ] SSL certificate active
- [ ] Custom domain configured (if applicable)

## Monitoring and Maintenance

### Health Checks
- Monitor `/api/health` endpoint
- Check database connection
- Monitor Cloudinary usage
- Track API response times

### Regular Tasks
- Update dependencies
- Monitor database performance
- Review security logs
- Backup database regularly

## Troubleshooting

### Common Issues
1. **API Routes Not Found**: Check Vercel rewrites configuration
2. **Database Connection**: Verify DATABASE_URL and connection pooling
3. **Image Upload Fails**: Check Cloudinary credentials and CORS
4. **Authentication Issues**: Verify JWT_SECRET is set properly

### Debug Tools
- Check Vercel function logs
- Use `/api/test` endpoint for connectivity
- Monitor browser network tab
- Check database query logs