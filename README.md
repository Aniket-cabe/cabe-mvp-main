# CaBE Arena - Full-Stack Development Platform

A comprehensive full-stack application built with React, Express.js, and MongoDB, designed for collaborative coding, skill assessment, and learning.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- OpenAI API key (for AI features)
- Git

### Local Development
```bash
# Clone the repository
git clone <repository-url>
cd cabe-arena

# Install dependencies
npm install

# Start development servers
npm run dev

# Backend will be available at http://localhost:3001
# Frontend will be available at http://localhost:3000
```

## 📋 Features

### Core Features
- **User Authentication & Authorization** - JWT-based auth with role-based access
- **Task Management** - Create, assign, and track coding tasks
- **Real-time Collaboration** - WebSocket-powered collaborative coding
- **AI-Powered Scoring** - Automated code assessment using OpenAI
- **Points & Achievements** - Gamified learning system
- **File Uploads** - Secure file handling with validation
- **Analytics Dashboard** - Real-time metrics and insights

### Technical Features
- **TypeScript** - Full type safety across frontend and backend
- **MongoDB** - Flexible document database with Mongoose ODM
- **Redis** - Caching and session management
- **WebSockets** - Real-time communication
- **Rate Limiting** - API protection and abuse prevention
- **Security** - CORS, CSRF, XSS protection, input validation
- **Monitoring** - Health checks, metrics, and logging

## 🏗️ Architecture

### Monorepo Structure
```
cabe-arena/
├── backend/          # Express.js API server
├── frontend/         # React + Vite application
├── shared/           # Shared configurations
├── scripts/          # Build and deployment scripts
└── docs/            # Documentation
```

### Technology Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js, TypeScript, Mongoose
- **Database**: MongoDB Atlas
- **Cache**: Redis
- **Real-time**: WebSocket, Socket.io
- **AI**: OpenAI API
- **Testing**: Vitest, Cypress
- **Deployment**: Render, Vercel, Docker

## 🚀 Deployment

### Option 1: Render (Recommended)
Deploy the complete application on Render with integrated services.

```bash
# 1. Push your code to Git
git push origin main

# 2. Connect to Render
# - Go to Render Dashboard
# - Create new Blueprint
# - Connect your repository
# - Render will auto-detect render.yaml

# 3. Configure environment variables
# - Set DATABASE_URL, JWT_SECRET, OPENAI_API_KEY
# - Configure other optional services
```

### Option 2: Vercel + Render Hybrid
Deploy frontend on Vercel and backend on Render.

```bash
# Backend on Render
# - Follow Render deployment steps for backend only

# Frontend on Vercel
# - Connect repository to Vercel
# - Set root directory to 'frontend'
# - Configure environment variables
```

### Option 3: Docker Deployment
Deploy using Docker containers.

```bash
# Development
docker-compose up

# Production
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
# Required
DATABASE_URL=mongodb+srv://...
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=sk-your-openai-api-key

# Optional
SUPABASE_URL=https://your-project.supabase.co
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env)
```bash
# Required
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001

# Optional
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_ENABLE_MOCK_DATA=true
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests with coverage
npm run test:coverage

# Run performance tests
npm run test:performance
```

## 📊 Monitoring

### Health Checks
- Backend: `GET /health`
- Detailed: `GET /health/detailed`
- Metrics: `GET /metrics`

### Logging
- Structured logging with Winston/Pino
- Log levels: error, warn, info, debug
- Production-ready log formatting

### Metrics
- Prometheus metrics endpoint
- Custom business metrics
- Performance monitoring

## 🔒 Security

### Implemented Security Measures
- **Authentication**: JWT with secure token handling
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Comprehensive validation with Zod
- **Rate Limiting**: API protection against abuse
- **CORS**: Configurable cross-origin resource sharing
- **CSRF Protection**: Token-based CSRF prevention
- **XSS Protection**: Input sanitization and output encoding
- **SQL Injection**: MongoDB injection prevention
- **File Upload Security**: Type and size validation
- **HTTPS Enforcement**: Automatic redirect in production

### Security Headers
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy

## 📈 Performance

### Optimization Features
- **Caching**: Redis-based caching layer
- **Compression**: Gzip compression for responses
- **CDN**: Static asset optimization
- **Database**: Connection pooling and indexing
- **Frontend**: Code splitting and lazy loading
- **Images**: Optimized image handling

### Monitoring
- Response time tracking
- Memory usage monitoring
- Database query optimization
- Error rate tracking

## 🔄 API Documentation

### Core Endpoints
- `GET /api/status` - API status
- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### WebSocket Events
- `connection` - Client connection
- `join-room` - Join collaboration room
- `code-change` - Code update
- `cursor-move` - Cursor position

## 🤝 Contributing

### Development Setup
```bash
# Install dependencies
npm install

# Set up pre-commit hooks
npm run prepare

# Start development
npm run dev
```

### Code Quality
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Husky for Git hooks

### Testing
- Unit tests with Vitest
- Integration tests
- E2E tests with Cypress
- Performance testing

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [API Documentation](./docs/api.md)
- [Database Schema](./docs/database.md)
- [Security Guide](./docs/security.md)

## 🆘 Support

### Common Issues
1. **Build Failures**: Check Node.js version (18+)
2. **Database Connection**: Verify DATABASE_URL format
3. **CORS Issues**: Check CORS_ORIGIN configuration
4. **Environment Variables**: Ensure all required vars are set

### Getting Help
- Check the troubleshooting section in [DEPLOYMENT.md](./DEPLOYMENT.md)
- Review application logs
- Test locally before deploying

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for AI capabilities
- MongoDB for database
- Render and Vercel for hosting
- The open-source community for tools and libraries
