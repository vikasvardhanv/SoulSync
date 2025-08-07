# SoulSync Frontend

A modern, AI-powered dating app frontend built with React, TypeScript, and Vite.

## 🚀 Features

### **Core Features**
- **AI-Powered Matching**: Advanced compatibility algorithms
- **Real-time Chat**: Instant messaging with matches
- **Crypto Payments**: Bitcoin, Ethereum, and other cryptocurrencies
- **PayPal Integration**: Traditional payment fallback
- **User Profiles**: Rich profile management
- **Compatibility Quiz**: Personality assessment
- **Date Planning**: AI-suggested date locations

### **Technical Features**
- **TypeScript**: Full type safety
- **Responsive Design**: Mobile-first approach
- **Real-time Updates**: Live chat and notifications
- **Error Handling**: Comprehensive error states
- **Loading States**: Smooth user experience
- **Authentication**: JWT token management
- **API Integration**: RESTful backend communication

## 🛠️ Tech Stack

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Axios** - HTTP Client
- **React Router** - Navigation
- **Zustand** - State Management
- **PayPal React** - Payment Integration

## 📦 Installation

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Backend server running

### **Setup**
```bash
# Install dependencies
npm install

# Copy environment variables
cp env.example .env

# Start development server
npm run dev
```

## ⚙️ Configuration

### **Environment Variables**
Create a `.env` file in the frontend directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5001/api

# App Configuration
VITE_APP_NAME=SoulSync

# Payment Configuration
VITE_PAYPAL_CLIENT_ID=your-paypal-client-id
```

### **Production Configuration**
For production deployment, update the environment variables:

```env
VITE_API_URL=https://your-backend-domain.vercel.app/api
VITE_PAYPAL_CLIENT_ID=your-production-paypal-client-id
```

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── PaymentModal.tsx # Payment handling
│   │   ├── AIMatching.tsx  # AI matching interface
│   │   ├── ChatInterface.tsx # Real-time chat
│   │   └── ...
│   ├── context/            # React context providers
│   ├── services/           # API services
│   │   └── api.ts         # API client configuration
│   ├── stores/            # State management
│   ├── data/              # Static data and utilities
│   └── main.tsx           # App entry point
├── public/                # Static assets
├── package.json           # Dependencies and scripts
└── vite.config.ts        # Vite configuration
```

## 🔧 Development

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### **Development Workflow**
1. **Start Backend**: Ensure backend server is running
2. **Start Frontend**: Run `npm run dev`
3. **Access App**: Open `http://localhost:5173`
4. **Hot Reload**: Changes auto-refresh in browser

### **API Integration**
The frontend communicates with the backend via RESTful APIs:

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Matches**: `/api/matches/*`
- **Messages**: `/api/messages/*`
- **Payments**: `/api/payments/*`
- **Questions**: `/api/questions/*`

## 💳 Payment Integration

### **Crypto Payments**
- **Primary Method**: Bitcoin, Ethereum, other cryptocurrencies
- **Provider**: Coinbase Commerce
- **Flow**: 
  1. User selects crypto payment
  2. Backend creates payment record
  3. Coinbase Commerce page opens
  4. Frontend polls for payment status
  5. Subscription activated on completion

### **PayPal Integration**
- **Fallback Method**: PayPal and credit cards
- **Provider**: PayPal React SDK
- **Flow**:
  1. User selects PayPal
  2. PayPal button renders
  3. Payment processed via PayPal
  4. Backend notified of completion

## 🔐 Authentication

### **JWT Token Management**
- **Access Token**: Short-lived (15 minutes)
- **Refresh Token**: Long-lived (7 days)
- **Auto-refresh**: Automatic token renewal
- **Secure Storage**: Local storage with encryption

### **Protected Routes**
- User profile management
- Match interactions
- Payment processing
- Chat functionality

## 📱 Responsive Design

### **Breakpoints**
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### **Mobile-First Approach**
- Touch-friendly interfaces
- Optimized for mobile performance
- Progressive Web App features

## 🎨 UI/UX Features

### **Animations**
- **Framer Motion**: Smooth transitions
- **Loading States**: Spinner animations
- **Micro-interactions**: Hover effects
- **Page Transitions**: Route animations

### **Design System**
- **Color Palette**: Pink/purple gradient theme
- **Typography**: Modern, readable fonts
- **Icons**: Lucide React icon set
- **Components**: Reusable UI components

## 🚀 Deployment

### **Vercel Deployment**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### **Build Process**
```bash
# Build for production
npm run build

# Preview build
npm run preview
```

### **Environment Variables**
Set these in your deployment platform:
- `VITE_API_URL`: Backend API URL
- `VITE_PAYPAL_CLIENT_ID`: PayPal client ID

## 🧪 Testing

### **Manual Testing**
- User registration/login
- Profile creation
- Compatibility quiz
- Payment processing
- Chat functionality
- Match interactions

### **Browser Compatibility**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🔧 Troubleshooting

### **Common Issues**

**API Connection Errors**
```bash
# Check backend is running
curl http://localhost:5001/api/health

# Verify environment variables
echo $VITE_API_URL
```

**Payment Issues**
- Verify PayPal client ID
- Check Coinbase Commerce configuration
- Ensure backend payment endpoints are working

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 API Reference

### **Authentication Endpoints**
```typescript
// Login
POST /api/auth/login
Body: { email: string, password: string }

// Register
POST /api/auth/register
Body: { email: string, password: string, name: string }

// Refresh Token
POST /api/auth/refresh
Body: { refreshToken: string }
```

### **User Endpoints**
```typescript
// Get Profile
GET /api/users/profile
Headers: Authorization: Bearer <token>

// Update Profile
PUT /api/users/profile
Body: { name?: string, bio?: string, interests?: string[] }

// Get Potential Matches
GET /api/users/matches
Query: { limit?: number, offset?: number }
```

### **Payment Endpoints**
```typescript
// Create Payment
POST /api/payments/create
Body: { amount: number, currency: string, description: string }

// Get Payment Status
GET /api/payments/:id/status
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting guide 