# CaBE Arena Deployment Guide

This guide covers deploying CaBE Arena on Render (backend) and Vercel (frontend).

## Backend Deployment (Render)

### Render Service Configuration

**Service Type:** Web Service  
**Root Directory:** `backend`  
**Build Command:** `npm ci && npm run build`  
**Start Command:** `npm start`  
**Node Version:** 20

### Environment Variables

Set these environment variables in your Render service:

```bash
# Database
DATABASE_URL=your_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Authentication
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRES_IN=24h

# AI Services
OPENAI_API_KEY=your_openai_api_key

# Email (Optional)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# Redis (Optional, for caching)
REDIS_URL=your_redis_url

# Monitoring
NODE_ENV=production
LOG_LEVEL=info
PORT=10000

# CORS
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Build Process

The backend uses `tsup` for transpilation without type checking to ensure builds succeed even with TypeScript errors. The build process:

1. Cleans the `dist` directory
2. Transpiles TypeScript to JavaScript using esbuild
3. Outputs CommonJS modules to `dist/`
4. Generates source maps for debugging

### Health Check Endpoint

The backend provides a health check endpoint at `/health` that verifies:
- Database connectivity
- AI service configuration
- External service configuration

## Frontend Deployment (Vercel)

### Vercel Configuration

**Framework Preset:** Vite  
**Root Directory:** `frontend`  
**Build Command:** `npm run build`  
**Output Directory:** `dist`  
**Install Command:** `npm ci`

### Environment Variables

Set these environment variables in your Vercel project:

```bash
# API Configuration
VITE_API_BASE_URL=https://your-backend-service.onrender.com
VITE_APP_NAME=CaBE Arena
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true
VITE_ENABLE_WEBSOCKET=true

# External Services
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Build Process

The frontend build process:

1. Runs TypeScript compilation (`tsc`)
2. Builds the Vite application
3. Generates optimized production assets
4. Creates PWA manifest and service worker

### PWA Features

The frontend includes Progressive Web App features:
- Service worker for offline functionality
- Web app manifest
- Automatic updates

## Cross-Platform Compatibility

### Backend Changes Made

1. **Replaced PowerShell commands** with cross-platform alternatives:
   - `rimraf` for directory cleaning
   - `tsup` for TypeScript transpilation
   - `tsx` for development

2. **Fixed dependency conflicts**:
   - Standardized on `bcryptjs` instead of `bcrypt`
   - Added missing type definitions

3. **Build system improvements**:
   - Uses `tsup` for fast transpilation without type checking
   - Generates CommonJS output for Node.js compatibility
   - Includes source maps for debugging

### Frontend Changes Made

1. **Resolved Vitest conflicts**:
   - Aligned all Vitest packages to version `1.6.1`
   - Added missing `@vitest/coverage-v8` and `@vitest/ui`

2. **Build optimization**:
   - TypeScript compilation before Vite build
   - Optimized bundle splitting
   - PWA integration

## Local Development

### Backend

```bash
cd backend
npm install
npm run dev          # Development with hot reload
npm run build        # Production build
npm start           # Run production build
```

### Frontend

```bash
cd frontend
npm install
npm run dev         # Development server
npm run build       # Production build
npm run preview     # Preview production build
```

## Troubleshooting

### Common Issues

1. **Backend build fails with TypeScript errors**
   - The build uses `tsup` which transpiles without type checking
   - Type errors won't prevent deployment but should be fixed for code quality

2. **Frontend build fails with Vitest conflicts**
   - Ensure all Vitest packages are version `1.6.1`
   - Remove any conflicting test dependencies

3. **CORS errors**
   - Verify `CORS_ORIGIN` is set correctly in backend
   - Ensure frontend URL matches the CORS configuration

4. **Database connection issues**
   - Check `DATABASE_URL` and Supabase credentials
   - Verify network connectivity from Render to your database

### Health Checks

- Backend: `https://your-backend.onrender.com/health`
- Frontend: Check Vercel deployment status in dashboard

## Security Notes

1. **Environment Variables**: Never commit sensitive values to version control
2. **CORS**: Configure CORS origins properly for production
3. **Rate Limiting**: Adjust rate limits based on expected traffic
4. **JWT Secrets**: Use strong, unique JWT secrets in production

## Performance Optimization

1. **Backend**: Uses cluster mode for multiple CPU cores
2. **Frontend**: Code splitting and lazy loading implemented
3. **Caching**: Redis integration for session and data caching
4. **CDN**: Vercel provides global CDN for frontend assets
