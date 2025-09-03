# 🚨 Railway Deployment Troubleshooting Guide

## 🔍 **Common Issues and Solutions**

### 1. **Health Check Failures**

#### **Symptoms**
- Build succeeds but health check fails
- Service shows "unhealthy" status
- Health check timeout errors

#### **Solutions**
1. **Check Health Check Path**: Ensure `/health` endpoint exists in backend
2. **Verify Port Binding**: Backend must bind to `0.0.0.0:PORT`
3. **Increase Start Period**: Health check needs time for app to start
4. **Check Environment Variables**: Ensure `PORT` is set correctly

#### **Health Check Configuration**
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=10 \
  CMD node scripts/health-check.js
```

### 2. **Build Failures**

#### **Symptoms**
- Docker build fails
- Dependency installation errors
- Network timeout issues

#### **Solutions**
1. **Use Resilient Build Scripts**: `scripts/railway-build-resilient.ps1`
2. **Registry Configuration**: Set npm registry in `.npmrc` and `.yarnrc`
3. **Fallback Package Managers**: yarn → npm fallback
4. **Network Timeouts**: Extended timeouts for slow connections

### 3. **Service Startup Issues**

#### **Symptoms**
- Container starts but app doesn't respond
- Port binding errors
- Process crashes on startup

#### **Solutions**
1. **Use Railway Start Script**: `scripts/railway-start.js`
2. **Environment Validation**: Check required environment variables
3. **Graceful Shutdown**: Handle SIGTERM and SIGINT signals
4. **Process Management**: Proper child process spawning

## 🛠️ **Debugging Steps**

### **Step 1: Check Build Logs**
```bash
# In Railway dashboard, check build logs for:
- Dependency installation success
- Build completion
- No error messages
```

### **Step 2: Check Runtime Logs**
```bash
# In Railway dashboard, check runtime logs for:
- Application startup messages
- Port binding confirmation
- Health check attempts
- Error messages
```

### **Step 3: Verify Environment Variables**
```bash
# Ensure these are set in Railway:
PORT=3000
NODE_ENV=production
DATABASE_URL=<your-database-url>
JWT_SECRET=<your-jwt-secret>
```

### **Step 4: Test Health Endpoint**
```bash
# The backend should respond to:
GET /health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "backend"
}
```

## 🔧 **Configuration Fixes**

### **Backend Dockerfile**
```dockerfile
# Use the backend-specific Dockerfile
FROM node:22-bullseye AS builder
# ... build steps ...

FROM node:22-bullseye AS runtime
# ... runtime setup ...

# Health check with proper timing
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=10 \
  CMD node scripts/health-check.js

# Start command using Railway script
CMD ["node", "scripts/railway-start.js"]
```

### **Railway Configuration**
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "backend/Dockerfile"
  },
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300
  }
}
```

### **Environment Variables**
```bash
# Backend Service
PORT=3000
NODE_ENV=production
DATABASE_URL=${{postgres.DATABASE_URL}}
JWT_SECRET=your-secret-key

# Frontend Service
VITE_API_BASE_URL=https://your-backend-service.railway.app
PORT=3000
```

## 📋 **Deployment Checklist**

### **Pre-Deployment**
- [ ] Backend builds successfully locally
- [ ] Health endpoint responds correctly
- [ ] Environment variables are configured
- [ ] Database connections are tested

### **Deployment**
- [ ] Use backend-specific Dockerfile
- [ ] Set proper health check configuration
- [ ] Configure environment variables
- [ ] Monitor build and runtime logs

### **Post-Deployment**
- [ ] Verify health check passes
- [ ] Test API endpoints
- [ ] Check database connectivity
- [ ] Monitor service performance

## 🚀 **Quick Fix Commands**

### **Local Testing**
```bash
# Test backend build
yarn build:backend

# Test backend start
yarn start:backend

# Test health endpoint
curl http://localhost:3000/health
```

### **Railway CLI**
```bash
# View logs
railway logs

# Set variables
railway variables set PORT=3000

# Redeploy
railway up
```

## 🎯 **Success Indicators**

- ✅ **Build completes** without errors
- ✅ **Service starts** and shows "running" status
- ✅ **Health check passes** after startup period
- ✅ **API responds** to requests
- ✅ **Database connections** established
- ✅ **Logs show** successful startup messages

---

**If issues persist, check the Railway logs and ensure all configuration files are properly committed and pushed to GitHub.**
