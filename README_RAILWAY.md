# 🚀 CaBE Arena Railway Deployment Guide

## 📋 **Quick Start**

This guide provides everything you need to deploy CaBE Arena on Railway as separate frontend and backend services.

## 🎯 **Railway Services**

### **Service 1: cabe-backend**
- **Build Command**: `yarn build:backend`
- **Start Command**: `yarn start:backend`
- **Watch Paths**: `/backend/**`
- **Dockerfile Path**: `backend/Dockerfile`
- **Railway Config**: `railway-backend.json`
- **Health Check Path**: `/health`
- **Health Check Timeout**: 300 seconds

### **Service 2: cabe-frontend**
- **Build Command**: `yarn build:frontend`
- **Start Command**: `yarn start:frontend`
- **Watch Paths**: `/frontend/**`
- **Dockerfile Path**: `frontend/Dockerfile`
- **Railway Config**: `railway-frontend.json`
- **Health Check Path**: `/health`
- **Health Check Timeout**: 60 seconds

## 🔧 **Environment Variables**

### **Backend Service Variables**
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

# Frontend URL
FRONTEND_URL=https://cabe-frontend-production-xxxx.up.railway.app

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Security
CORS_ORIGIN=https://cabe-frontend-production-xxxx.up.railway.app
ENABLE_METRICS=true
ENABLE_HEALTH_CHECKS=true
```

### **Frontend Service Variables**
```bash
# API Configuration
VITE_API_BASE_URL=https://cabe-backend-production-xxxx.up.railway.app
BACKEND_URL=https://cabe-backend-production-xxxx.up.railway.app

# Environment
NODE_ENV=production
PORT=3000

# App Configuration
VITE_APP_NAME=CaBE Arena
VITE_APP_VERSION=1.0.0
```

## 🗄️ **Database Plugins**

### **PostgreSQL Plugin**
- **Service Name**: `postgres`
- **Reference in Backend**: `${{postgres.DATABASE_URL}}`

### **MongoDB Plugin**
- **Service Name**: `mongodb`
- **Reference in Backend**: `${{mongodb.MONGODB_URI}}`

## 🚀 **Deployment Steps**

### **Step 1: Create Railway Project**
1. Go to [Railway Dashboard](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `cabe-arena` repository
5. Name: `cabe-arena-monorepo`

### **Step 2: Add Backend Service**
1. Click "New Service" → "GitHub Repo"
2. **Service Name**: `cabe-backend`
3. **Root Directory**: `/` (leave default)
4. **Build Command**: `yarn build:backend`
5. **Start Command**: `yarn start:backend`
6. **Watch Paths**: `/backend/**`
7. **Dockerfile Path**: `backend/Dockerfile`

### **Step 3: Add Frontend Service**
1. Click "New Service" → "GitHub Repo"
2. **Service Name**: `cabe-frontend`
3. **Root Directory**: `/` (leave default)
4. **Build Command**: `yarn build:frontend`
5. **Start Command**: `yarn start:frontend`
6. **Watch Paths**: `/frontend/**`
7. **Dockerfile Path**: `frontend/Dockerfile`

### **Step 4: Add Database Plugins**
1. Click "New Service" → "Plugin" → "PostgreSQL"
2. **Service Name**: `postgres`
3. Click "New Service" → "Plugin" → "MongoDB"
4. **Service Name**: `mongodb`

### **Step 5: Configure Environment Variables**
1. Go to `cabe-backend` service → "Variables"
2. Set all backend variables (see above)
3. Go to `cabe-frontend` service → "Variables"
4. Set all frontend variables (see above)

### **Step 6: Deploy Services**
1. Deploy `cabe-backend` first
2. Wait for successful deployment
3. Deploy `cabe-frontend`
4. Wait for successful deployment

## ✅ **Verification Steps**

### **Backend Verification**
- [ ] Service shows "Deployed" status
- [ ] Health check passes: `/health` returns 200
- [ ] Logs show successful startup
- [ ] Database connections established

### **Frontend Verification**
- [ ] Service shows "Deployed" status
- [ ] Health check passes: `/health` returns 200
- [ ] Frontend loads without errors
- [ ] Static files served correctly

### **Integration Verification**
- [ ] Frontend can communicate with backend
- [ ] API calls work correctly
- [ ] CORS configuration working
- [ ] Both services accessible via public URLs

## 🔧 **Local Testing Commands**

```bash
# Install dependencies
yarn install

# Build both services
yarn build:backend
yarn build:frontend

# Test backend locally
yarn start:backend

# Test frontend locally
yarn start:frontend

# Run validation script
bash scripts/validate-railway-deployment.sh
```

## 🚨 **Troubleshooting**

### **Build Failures**
- Check build logs for dependency issues
- Verify `yarn install` completes successfully
- Ensure all environment variables are set

### **Runtime Errors**
- Check service logs for application errors
- Verify database connection strings
- Check CORS configuration

### **Health Check Failures**
- **Backend**: Ensure backend starts successfully and `/health` endpoint exists
- **Frontend**: Ensure nginx serves static files and `/health` endpoint exists
- Check if services bind to correct ports
- Verify environment variables are set correctly

## 📚 **Useful Commands**

### **Railway CLI**
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

### **Git Commands**
```bash
# Check status
git status

# View recent commits
git log --oneline -5

# Push changes
git push origin main
```

## 🔄 **Rollback Procedures**

If deployment fails, use the rollback procedures outlined in `ROLLBACK-PLAN.md`:

```bash
# Complete rollback
git revert <commit-hash>
git push origin main

# Selective rollback
git checkout HEAD~1 -- backend/Dockerfile
git add backend/Dockerfile
git commit -m "rollback: revert backend Dockerfile"
git push origin main
```

## 📖 **Additional Documentation**

- **Full Deployment Guide**: `RAILWAY-DEPLOYMENT-PLAYBOOK.md`
- **Rollback Procedures**: `ROLLBACK-PLAN.md`
- **Validation Script**: `scripts/validate-railway-deployment.sh`
- **Troubleshooting**: `RAILWAY-TROUBLESHOOTING.md`

## 🎉 **Success Indicators**

- ✅ Both services show "Deployed" status
- ✅ Health checks pass for both services
- ✅ Frontend loads and displays correctly
- ✅ API calls work between services
- ✅ Database connections established
- ✅ Public URLs accessible

---

**Your CaBE Arena application is now successfully deployed on Railway!** 🚀

For detailed deployment instructions, see: `RAILWAY-DEPLOYMENT-PLAYBOOK.md`
