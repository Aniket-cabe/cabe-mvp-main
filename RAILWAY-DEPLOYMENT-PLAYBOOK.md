# 🚀 Railway Deployment Playbook for CaBE Arena

## 📋 **Prerequisites**
- Railway account created
- GitHub repository connected
- Local development environment working

## 🎯 **Deployment Strategy**
We'll create **two separate Railway services**:
1. **cabe-backend** - Express API service
2. **cabe-frontend** - React frontend service

## 🚀 **Step 1: Create Railway Project**

### 1.1 **Create New Project**
- Go to [Railway Dashboard](https://railway.app)
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your `cabe-arena` repository
- Name: `cabe-arena-monorepo`

### 1.2 **Project Settings**
- **Root Directory**: `/` (leave default)
- **Branch**: `main`
- **Auto-Deploy**: ✅ Enabled

## 🔧 **Step 2: Create Backend Service**

### 2.1 **Add Backend Service**
- In your Railway project, click "New Service"
- Select "GitHub Repo"
- **Service Name**: `cabe-backend`
- **Root Directory**: `/` (leave default)

### 2.2 **Backend Build Configuration**
- **Build Command**: `yarn build:backend`
- **Start Command**: `yarn start:backend`
- **Watch Paths**: `/backend/**`

### 2.3 **Backend Environment Variables**
Set these in the backend service variables:

```bash
# Database
DATABASE_URL=${{postgres.DATABASE_URL}}
MONGO_URL=${{mongodb.MONGODB_URI}}

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# Server
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Frontend URL (will be set after frontend deployment)
FRONTEND_URL=https://your-frontend-service.railway.app

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Security
CORS_ORIGIN=https://your-frontend-service.railway.app
ENABLE_METRICS=true
ENABLE_HEALTH_CHECKS=true
```

### 2.4 **Backend Health Check**
- **Health Check Path**: `/health`
- **Health Check Timeout**: 30 seconds

## 🌐 **Step 3: Create Frontend Service**

### 3.1 **Add Frontend Service**
- In your Railway project, click "New Service"
- Select "GitHub Repo"
- **Service Name**: `cabe-frontend`
- **Root Directory**: `/` (leave default)

### 3.2 **Frontend Build Configuration**
- **Build Command**: `yarn build:frontend`
- **Start Command**: `yarn start:frontend`
- **Watch Paths**: `/frontend/**`

### 3.3 **Frontend Environment Variables**
Set these in the frontend service variables:

```bash
# API Configuration
VITE_API_BASE_URL=https://your-backend-service.railway.app

# Environment
NODE_ENV=production
PORT=3000

# App Configuration
VITE_APP_NAME=CaBE Arena
VITE_APP_VERSION=1.0.0
```

## 🗄️ **Step 4: Add Database Plugins**

### 4.1 **Add PostgreSQL Plugin**
- In your Railway project, click "New Service"
- Select "Plugin" → "PostgreSQL"
- **Service Name**: `postgres`
- **Version**: Latest stable

### 4.2 **Add MongoDB Plugin**
- In your Railway project, click "New Service"
- Select "Plugin" → "MongoDB"
- **Service Name**: `mongodb`
- **Version**: Latest stable

### 4.3 **Link Databases to Backend**
- Go to `cabe-backend` service
- Click "Variables" tab
- Update these variables to reference the plugins:
  ```bash
  DATABASE_URL=${{postgres.DATABASE_URL}}
  MONGO_URL=${{mongodb.MONGODB_URI}}
  ```

## 🔗 **Step 5: Link Services**

### 5.1 **Update Frontend API URL**
- Go to `cabe-frontend` service
- Click "Variables" tab
- Update `VITE_API_BASE_URL` to your backend service URL:
  ```bash
  VITE_API_BASE_URL=https://cabe-backend-production-xxxx.up.railway.app
  ```

### 5.2 **Update Backend CORS**
- Go to `cabe-backend` service
- Click "Variables" tab
- Update `FRONTEND_URL` and `CORS_ORIGIN` to your frontend service URL:
  ```bash
  FRONTEND_URL=https://cabe-frontend-production-xxxx.up.railway.app
  CORS_ORIGIN=https://cabe-frontend-production-xxxx.up.railway.app
  ```

## 🚀 **Step 6: Deploy and Test**

### 6.1 **Deploy Backend First**
- Go to `cabe-backend` service
- Click "Deploy" button
- Wait for build to complete
- Verify health check passes: `/health`

### 6.2 **Deploy Frontend**
- Go to `cabe-frontend` service
- Click "Deploy" button
- Wait for build to complete
- Verify frontend loads

### 6.3 **Test Integration**
- Test frontend loads: `https://cabe-frontend-production-xxxx.up.railway.app`
- Test backend health: `https://cabe-backend-production-xxxx.up.railway.app/health`
- Test API calls from frontend

## ✅ **Step 7: Verification Checklist**

- [ ] Backend service shows "Deployed" status
- [ ] Frontend service shows "Deployed" status
- [ ] Backend health check passes (`/health` returns 200)
- [ ] Frontend loads without errors
- [ ] API calls from frontend to backend work
- [ ] Database connections established
- [ ] Environment variables properly set
- [ ] Services accessible via public URLs

## 🔧 **Troubleshooting**

### Build Failures
- Check build logs for dependency issues
- Verify `yarn install` completes successfully
- Ensure all environment variables are set

### Runtime Errors
- Check service logs for application errors
- Verify database connection strings
- Check CORS configuration

### Health Check Failures
- Ensure backend starts successfully
- Check if `/health` endpoint exists
- Verify port binding to `0.0.0.0`

## 📚 **Useful Commands**

### Railway CLI (Optional)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link project
railway login
railway link

# View logs
railway logs

# Set variables
railway variables set KEY=value

# Deploy manually
railway up
```

### Local Testing
```bash
# Test backend build
yarn build:backend

# Test frontend build
yarn build:frontend

# Test backend start
yarn start:backend

# Test frontend preview
yarn start:frontend
```

## 🎉 **Success Indicators**

- ✅ Both services show "Deployed" status
- ✅ Health checks pass
- ✅ Frontend loads and displays correctly
- ✅ API calls work between services
- ✅ Database connections established
- ✅ Public URLs accessible

---

**Your CaBE Arena application is now successfully deployed on Railway!** 🚀
