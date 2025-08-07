# SoulSync Dating App - Full Stack Monorepo

A modern, AI-powered dating application built with React frontend and Node.js backend.

## 🏗️ Architecture Overview

```
soulsync/
├── frontend/          # React + Vite + TypeScript
│   ├── src/          # React components and logic
│   ├── package.json  # Frontend dependencies
│   └── ...
├── backend/           # Node.js + Express + PostgreSQL
│   ├── src/          # Server code and API routes
│   ├── package.json  # Backend dependencies
│   └── ...
└── package.json      # Monorepo root configuration
```

## 🤔 Why Separate Frontend and Backend?

### **Different Technologies & Purposes**

| Frontend | Backend |
|----------|---------|
| **React** - UI Framework | **Node.js** - Server Runtime |
| **Vite** - Build Tool | **Express** - Web Framework |
| **TypeScript** - Type Safety | **PostgreSQL** - Database |
| **Browser** - Client-side | **Server** - Server-side |
| **User Interface** | **Business Logic** |

### **Why Two npm Processes?**

1. **🏃‍♂️ Different Runtimes**
   - Frontend: Runs in browser (Vite dev server)
   - Backend: Runs on server (Node.js process)

2. **🔄 Different Development Cycles**
   - Frontend: Hot reload for UI changes
   - Backend: Restart for server changes

3. **🔧 Different Dependencies**
   - Frontend: React, UI libraries
   - Backend: Database, authentication, APIs

4. **🌐 Different Ports**
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:5001`

## 🚀 Quick Start

### **Option 1: Start Everything at Once**
```bash
# Install all dependencies
npm run install:all

# Setup backend (database, env)
npm run setup

# Start both frontend and backend
npm run dev
```

### **Option 2: Start Separately**
```bash
# Terminal 1: Backend
cd backend
npm install
npm run setup
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

## 📋 Available Scripts

### **Root Level (Monorepo)**
```bash
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start only frontend
npm run dev:backend      # Start only backend
npm run build            # Build both projects
npm run setup            # Setup both projects
npm run install:all      # Install all dependencies
```

### **Frontend Only**
```bash
cd frontend
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
```

### **Backend Only**
```bash
cd backend
npm run dev              # Start with nodemon
npm start                # Start production server
npm run migrate          # Run database migrations
npm run seed             # Seed database with questions
npm run setup            # Interactive setup
```

## 🔧 Development Workflow

### **1. Initial Setup**
```bash
# Clone and setup
git clone <repository>
cd soulsync
npm run install:all
npm run setup
```

### **2. Daily Development**
```bash
# Start both services
npm run dev

# Frontend: http://localhost:5173
# Backend: http://localhost:5001
```

### **3. Making Changes**
- **Frontend changes**: Auto-reload in browser
- **Backend changes**: Auto-restart with nodemon
- **Database changes**: Run `npm run migrate`

## 🌐 API Communication

### **Development**
```
Frontend (localhost:5173) 
    ↓ HTTP requests
Backend (localhost:5001)
    ↓ Database queries
PostgreSQL Database
```

### **Production**
```
Frontend (Static files)
    ↓ HTTP requests
Backend (API server)
    ↓ Database queries
PostgreSQL Database
```

## 📁 Project Structure

```
soulsync/
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API service calls
│   │   ├── stores/            # State management
│   │   └── utils/             # Utility functions
│   ├── public/                # Static assets
│   ├── package.json           # Frontend dependencies
│   └── vite.config.ts         # Vite configuration
│
├── backend/                    # Node.js Backend
│   ├── src/
│   │   ├── routes/            # API route handlers
│   │   ├── middleware/        # Express middleware
│   │   ├── database/          # Database connection & migrations
│   │   └── utils/             # Backend utilities
│   ├── package.json           # Backend dependencies
│   └── .env                   # Environment variables
│
└── package.json               # Monorepo configuration
```

## 🔐 Environment Variables

### **Backend (.env)**
```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/soulsync_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=soulsync_db
DB_USER=username
DB_PASSWORD=password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# External APIs
OPENAI_API_KEY=your-openai-key
PAYPAL_CLIENT_ID=your-paypal-id
```

### **Frontend (.env)**
```env
VITE_API_URL=http://localhost:5001/api
VITE_APP_NAME=SoulSync
```

## 🚀 Deployment

### **Development**
```bash
npm run dev
```

### **Production**
```bash
# Build both projects
npm run build

# Start production servers
npm start
```

### **Docker Deployment**
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🤝 Why This Architecture?

### **✅ Benefits**
- **Separation of Concerns**: UI logic separate from business logic
- **Scalability**: Can scale frontend and backend independently
- **Technology Flexibility**: Can use different tech stacks
- **Team Development**: Frontend and backend teams can work independently
- **Deployment Flexibility**: Deploy frontend and backend separately

### **❌ Alternative: Single App**
Some apps combine frontend and backend in one process, but this limits:
- Technology choices
- Scalability options
- Team collaboration
- Deployment flexibility

## 🆘 Common Issues

### **Port Already in Use**
```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:5000 | xargs kill -9  # Backend
```

### **Database Connection Issues**
```bash
# Check PostgreSQL
brew services list | grep postgresql
brew services start postgresql
```

### **Dependencies Issues**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 📚 Next Steps

1. **Setup**: Run `npm run setup`
2. **Development**: Run `npm run dev`
3. **Database**: Run `npm run migrate && npm run seed`
4. **Testing**: Run `npm test`
5. **Deployment**: Run `npm run build`

## 🎯 Summary

**Why two npm processes?**
- Frontend and backend are different applications
- They run on different ports and technologies
- They serve different purposes (UI vs API)
- They can be developed and deployed independently

This architecture gives you maximum flexibility and scalability! 🚀 