# 🚀 Railway Deployment Playbook for CaBE Arena

## Overview
This playbook provides step-by-step instructions for deploying the CaBE Arena monorepo to Railway as separate frontend and backend services.

## Prerequisites
- Railway account (free tier available)
- GitHub repository with the code
- Node.js 18-22 locally for testing

## Local Validation Steps

### 1. Install Dependencies
```bash
yarn install
```

### 2. Build Both Services
```bash
# Build backend (produces backend/dist/)
yarn build:backend

# Build frontend (produces frontend/dist/)
yarn build:frontend

# Or build both at once
yarn build
```

### 3. Test Backend Locally
```bash
# Start backend on port 3001
yarn start:backend

# In another terminal, test health endpoint
curl http://localhost:3001/health
```

### 4. Test Frontend Locally
```bash
# Start frontend preview server
yarn start:frontend

# Visit http://localhost:3000 in browser
```

## Railway Deployment Steps

### Step 1: Create Railway Project
1. Go to [Railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `cabe-arena` repository

### Step 2: Add Database Services
1. In your Railway project, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Note the service name (e.g., `postgres`)
4. Click "New Service" again
5. Select "Database" → "MongoDB"
6. Note the service name (e.g., `mongodb`)

### Step 3: Create Backend Service
1. Click "New Service" → "GitHub Repo"
2. Select your repository
3. Configure the backend service:
   - **Service Name**: `cabe-backend`
   - **Root Directory**: `/` (default)
   - **Build Command**: `yarn build:backend`
   - **Start Command**: `yarn start:backend`
   - **Watch Paths**: `/backend/**`

### Step 4: Create Frontend Service
1. Click "New Service" → "GitHub Repo"
2. Select your repository
3. Configure the frontend service:
   - **Service Name**: `cabe-frontend`
   - **Root Directory**: `/` (default)
   - **Build Command**: `yarn build:frontend`
   - **Start Command**: `yarn start:frontend`
   - **Watch Paths**: `/frontend/**`

### Step 5: Configure Environment Variables

#### Backend Service Variables
Set these in the `cabe-backend` service:

```bash
# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database URLs (use Railway's variable references)
DATABASE_URL=${{postgres.DATABASE_URL}}
MONGO_URL=${{mongodb.MONGODB_URI}}

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# Frontend URL (update after frontend deploys)
FRONTEND_URL=https://cabe-frontend-production.up.railway.app
CORS_ORIGIN=https://cabe-frontend-production.up.railway.app

# Supabase (if using)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# AI Services (optional)
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4

# Feature Flags
ENABLE_AI_SCORING=true
ENABLE_AUDIT_LOGGING=true
ENABLE_SLACK_NOTIFICATIONS=false

# Logging
LOG_LEVEL=info
```

#### Frontend Service Variables
Set these in the `cabe-frontend` service:

```bash
# Environment
NODE_ENV=production
PORT=3000

# API Configuration (update with actual backend URL)
VITE_API_BASE_URL=https://cabe-backend-production.up.railway.app
BACKEND_URL=https://cabe-backend-production.up.railway.app

# App Configuration
VITE_APP_NAME=CaBE Arena
VITE_APP_VERSION=1.0.0
```

### Step 6: Configure Health Checks
1. In the `cabe-backend` service settings:
   - **Health Check Path**: `/health`
   - **Health Check Timeout**: 30 seconds
2. In the `cabe-frontend` service settings:
   - **Health Check Path**: `/health`
   - **Health Check Timeout**: 30 seconds

### Step 7: Deploy Services
1. Click "Deploy" on both services
2. Monitor the deployment logs
3. Wait for both services to show "HEALTH = OK"

### Step 8: Update URLs
After both services are deployed:
1. Get the public URLs from Railway dashboard
2. Update the `FRONTEND_URL` and `CORS_ORIGIN` in backend service
3. Update the `VITE_API_BASE_URL` and `BACKEND_URL` in frontend service
4. Redeploy both services

## Verification Steps

### 1. Test Backend Health
```bash
curl https://your-backend-url.up.railway.app/health
```
Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "services": {
    "database": "up",
    "redis": "up"
  }
}
```

### 2. Test Frontend
1. Visit the frontend URL in your browser
2. Check browser console for any errors
3. Test basic functionality (login, navigation)

### 3. Test API Integration
1. Open browser developer tools
2. Check Network tab for API calls
3. Verify API calls are going to the correct backend URL

## Troubleshooting

### Common Issues

#### Build Failures
- Check Railway logs for specific error messages
- Ensure all dependencies are in `package.json`
- Verify workspace configuration

#### Health Check Failures
- Check if services are binding to `0.0.0.0:PORT`
- Verify health check endpoints return 200 status
- Check Railway logs for startup errors

#### CORS Issues
- Ensure `CORS_ORIGIN` includes the frontend URL
- Check that `FRONTEND_URL` is set correctly
- Verify Railway domains are in CORS whitelist

#### Database Connection Issues
- Verify database service names match variable references
- Check database URLs are properly formatted
- Ensure database services are running

### Debugging Commands

#### Check Service Logs
```bash
# Using Railway CLI
railway logs --service cabe-backend
railway logs --service cabe-frontend
```

#### Test Locally with Railway Variables
```bash
# Set environment variables locally
export DATABASE_URL="your-postgres-url"
export MONGO_URL="your-mongo-url"
export JWT_SECRET="your-jwt-secret"

# Run locally
yarn start:backend
```

## Rollback Plan

If deployment fails:

### 1. Revert Code Changes
```bash
git revert <commit-hash>
git push origin main
```

### 2. Restore Specific Files
```bash
git checkout HEAD~1 -- backend/package.json
git checkout HEAD~1 -- frontend/package.json
```

### 3. Redeploy Services
1. Trigger new deployment in Railway
2. Monitor logs for issues
3. Rollback to previous working version if needed

## Performance Optimization

### 1. Enable Caching
- Set appropriate cache headers in nginx config
- Use Railway's CDN for static assets

### 2. Database Optimization
- Monitor database performance in Railway dashboard
- Consider connection pooling settings

### 3. Resource Scaling
- Monitor CPU and memory usage
- Scale services as needed in Railway dashboard

## Security Considerations

### 1. Environment Variables
- Never commit secrets to git
- Use Railway's secure environment variable storage
- Rotate JWT secrets regularly

### 2. CORS Configuration
- Only allow necessary origins
- Use HTTPS in production

### 3. Database Security
- Use strong passwords
- Enable SSL connections
- Regular security updates

## Monitoring and Maintenance

### 1. Health Monitoring
- Set up Railway alerts for service failures
- Monitor response times and error rates

### 2. Log Management
- Review logs regularly
- Set up log aggregation if needed

### 3. Updates
- Keep dependencies updated
- Test updates in staging environment first
- Use Railway's zero-downtime deployments

## Support

For issues with this deployment:
1. Check Railway documentation
2. Review service logs
3. Test locally with same environment variables
4. Contact Railway support if needed

---

**Last Updated**: January 2024
**Version**: 1.0.0