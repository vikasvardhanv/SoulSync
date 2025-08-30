# SoulSync - AI-Powered Dating Platform

SoulSync is a modern dating application that uses AI to create meaningful connections based on deep compatibility analysis.

## Features

- **AI-Powered Matching**: Advanced compatibility analysis using personality and preference data
- **Secure Authentication**: JWT-based authentication with email verification
- **Real-time Messaging**: Chat with your matches in real-time
- **Photo Management**: Upload and manage up to 6 profile photos
- **Premium Subscriptions**: Enhanced features with crypto payment support
- **Personality Quizzes**: Comprehensive compatibility assessments
- **Mobile Responsive**: Works seamlessly on all devices

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Zustand for state management
- React Router for navigation
- Framer Motion for animations

### Backend
- Node.js with Express
- PostgreSQL database with Prisma ORM
- JWT authentication
- Cloudinary for image storage
- Email service integration
- Rate limiting and security middleware

## Getting Started

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database
- Cloudinary account (for image storage)
- Email service credentials

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd soulsync
```

2. Install dependencies:
```bash
npm run install-all
```

3. Set up environment variables:

Create `.env` files in both `frontend` and `backend` directories with the required variables.

**Backend `.env`:**
```env
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
EMAIL_HOST="your-email-host"
EMAIL_PORT=587
EMAIL_USER="your-email-user"
EMAIL_PASS="your-email-password"
```

**Frontend `.env`:**
```env
VITE_API_URL="http://localhost:5001/api"
```

4. Set up the database:
```bash
cd backend
npx prisma migrate deploy
npm run seed
```

5. Build the application:
```bash
npm run build-frontend
npm run build-backend
```

6. Start the production server:
```bash
npm start
```

The application will be available at `http://localhost:5001`

## Production Deployment

### Environment Setup
- Set `NODE_ENV=production`
- Configure production database
- Set up proper CORS origins
- Configure email service
- Set up Cloudinary for image storage

### Security Considerations
- Use strong JWT secrets
- Configure rate limiting
- Set up proper CORS policies
- Use HTTPS in production
- Implement proper error handling

## API Documentation

The backend provides a RESTful API with the following main endpoints:

- `/api/auth/*` - Authentication and user management
- `/api/users/*` - User profiles and matching
- `/api/images/*` - Photo upload and management
- `/api/matches/*` - Match creation and management
- `/api/messages/*` - Real-time messaging
- `/api/payments/*` - Subscription and payment handling
- `/api/questions/*` - Personality quiz system

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For support and questions, please contact the development team.