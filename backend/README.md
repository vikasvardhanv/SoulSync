# SoulSync Backend - Production Ready

A production-ready Node.js backend for the SoulSync AI-powered dating app with Prisma ORM and crypto payments.

## 🚀 Features

- **Prisma ORM**: Type-safe database operations with PostgreSQL
- **Crypto Payments**: Coinbase Commerce integration for cryptocurrency payments
- **AI Matching**: Real user-based matching with compatibility scoring
- **JWT Authentication**: Secure token-based authentication
- **Real-time Messaging**: WebSocket-ready message system
- **Subscription Management**: Premium feature management
- **Production Security**: Helmet, rate limiting, CORS, validation

## 🏗️ Architecture

```
backend/
├── src/
│   ├── routes/           # API endpoints
│   │   ├── auth.js       # Authentication
│   │   ├── users.js      # User management
│   │   ├── matches.js    # Matching logic
│   │   ├── messages.js   # Messaging
│   │   ├── questions.js  # Quiz system
│   │   ├── subscriptions.js # Premium features
│   │   └── payments.js   # Crypto payments
│   ├── middleware/       # Express middleware
│   ├── database/         # Prisma client
│   └── server.js         # Entry point
├── prisma/
│   └── schema.prisma     # Database schema
└── package.json
```

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with refresh tokens
- **Payments**: Coinbase Commerce (crypto)
- **Security**: Helmet, rate limiting, CORS
- **Validation**: Express-validator
- **Logging**: Morgan

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- Coinbase Commerce account (for crypto payments)
- Environment variables configured

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
cp env.example .env
# Edit .env with your configuration
```

### 3. Database Setup
```bash
# Push schema to database
npm run db:push

# Or run migrations
npm run migrate

# Generate Prisma client
npm run db:generate
```

### 4. Start Development Server
```bash
npm run dev
```

## 🔧 Environment Variables

### Required Variables
```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/soulsync_db"

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Crypto Payments
COINBASE_API_KEY=your-coinbase-api-key
COINBASE_WEBHOOK_SECRET=your-coinbase-webhook-secret
```

### Optional Variables
```env
# Server
PORT=5001
NODE_ENV=development

# Security
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_MAX_REQUESTS=100

# External APIs
OPENAI_API_KEY=your-openai-key
```

## 📊 Database Schema

### Core Models
- **User**: User profiles and authentication
- **Match**: User matching relationships
- **Message**: Real-time messaging
- **Question**: Compatibility quiz questions
- **UserAnswer**: User quiz responses
- **Subscription**: Premium subscriptions
- **Payment**: Crypto payment records
- **RefreshToken**: JWT refresh tokens

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/matches` - Get potential matches
- `GET /api/users/matches/my` - Get user's matches

### Matching
- `POST /api/matches` - Create match
- `PUT /api/matches/:id/status` - Update match status
- `GET /api/matches/pending` - Get pending matches
- `GET /api/matches/accepted` - Get accepted matches

### Messaging
- `POST /api/messages` - Send message
- `GET /api/messages/conversation/:userId` - Get conversation
- `GET /api/messages/conversations` - Get all conversations
- `PUT /api/messages/read/:senderId` - Mark as read

### Payments
- `POST /api/payments/create` - Create crypto payment
- `POST /api/payments/webhook` - Coinbase webhook
- `GET /api/payments/:id/status` - Get payment status
- `GET /api/payments/history` - Payment history

## 💰 Crypto Payment Integration

### Coinbase Commerce Setup
1. Create Coinbase Commerce account
2. Get API key and webhook secret
3. Configure environment variables
4. Set up webhook endpoint

### Payment Flow
1. User initiates payment via `/api/payments/create`
2. Coinbase Commerce charge created
3. User redirected to payment page
4. Payment confirmed via webhook
5. Subscription activated automatically

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with configurable rounds
- **Rate Limiting**: Request throttling
- **CORS Protection**: Cross-origin security
- **Input Validation**: Express-validator
- **Helmet**: Security headers
- **Webhook Verification**: Crypto signature validation

## 🚀 Production Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production `DATABASE_URL`
3. Set secure JWT secrets
4. Configure Coinbase webhook URL

### Database Migration
```bash
# Production migration
npm run migrate:deploy

# Generate client
npm run db:generate
```

## 📈 Performance

- **Connection Pooling**: Prisma connection management
- **Query Optimization**: Efficient Prisma queries
- **Caching**: Redis-ready architecture
- **Compression**: Response compression
- **Rate Limiting**: API protection

## 🧪 Testing

```bash
# Run tests
npm test

# Test coverage
npm run test:coverage
```

## 📝 API Documentation

### Request/Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors
  ]
}
```

## 🔄 Database Migrations

### Create Migration
```bash
npm run migrate
```

### Deploy Migration
```bash
npm run migrate:deploy
```

### Reset Database
```bash
npm run db:push --force-reset
```

## 🛠️ Development

### Database Studio
```bash
npm run db:studio
```

### Seed Data
```bash
npm run seed
```

### Linting
```bash
npm run lint
```

## 📚 Next Steps

1. **AI Integration**: Implement OpenAI-based matching
2. **Real-time**: Add WebSocket support
3. **Analytics**: User behavior tracking
4. **Notifications**: Push notifications
5. **Media**: Image/video uploads

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details 