# 🚀 Railway Deployment Checklist

## ✅ **Pre-Deployment Checklist**

### **1. Environment Variables Setup**
- [ ] **Backend Service Variables:**
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3000`
  - [ ] `JWT_SECRET` (32+ characters, random)
  - [ ] `FRONTEND_URL` (your frontend Railway URL)
  - [ ] `CORS_ORIGIN` (same as FRONTEND_URL)
  - [ ] `DATABASE_URL` (if using PostgreSQL)
  - [ ] `MONGO_URL` (if using MongoDB)
  - [ ] `SUPABASE_URL` (if using Supabase)
  - [ ] `SUPABASE_ANON_KEY` (if using Supabase)
  - [ ] `OPENAI_API_KEY` (if using AI features)

- [ ] **Frontend Service Variables:**
  - [ ] `VITE_API_BASE_URL` (your backend Railway URL)
  - [ ] `BACKEND_URL` (same as VITE_API_BASE_URL)
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3000`

### **2. Database Setup**
- [ ] **PostgreSQL Plugin** (if using PostgreSQL):
  - [ ] Add PostgreSQL plugin to Railway project
  - [ ] Service name: `postgres`
  - [ ] Reference: `${{postgres.DATABASE_URL}}`

- [ ] **MongoDB Plugin** (if using MongoDB):
  - [ ] Add MongoDB plugin to Railway project
  - [ ] Service name: `mongodb`
  - [ ] Reference: `${{mongodb.MONGODB_URI}}`

### **3. Service Configuration**
- [ ] **Backend Service:**
  - [ ] Service name: `cabe-backend`
  - [ ] Dockerfile path: `backend/Dockerfile`
  - [ ] Health check path: `/health`
  - [ ] Health check timeout: 300 seconds

- [ ] **Frontend Service:**
  - [ ] Service name: `cabe-frontend`
  - [ ] Dockerfile path: `frontend/Dockerfile`
  - [ ] Health check path: `/health`
  - [ ] Health check timeout: 60 seconds

## 🚀 **Deployment Steps**

### **Step 1: Deploy Backend**
1. [ ] Go to Railway dashboard
2. [ ] Select `cabe-backend` service
3. [ ] Click "Deploy"
4. [ ] Wait for build to complete
5. [ ] Check logs for any errors
6. [ ] Verify health check passes: `https://your-backend-url/health`

### **Step 2: Deploy Frontend**
1. [ ] Go to Railway dashboard
2. [ ] Select `cabe-frontend` service
3. [ ] Click "Deploy"
4. [ ] Wait for build to complete
5. [ ] Check logs for any errors
6. [ ] Verify health check passes: `https://your-frontend-url/health`

### **Step 3: Update Environment Variables**
1. [ ] Update `FRONTEND_URL` in backend service with actual frontend URL
2. [ ] Update `CORS_ORIGIN` in backend service with actual frontend URL
3. [ ] Update `VITE_API_BASE_URL` in frontend service with actual backend URL
4. [ ] Update `BACKEND_URL` in frontend service with actual backend URL
5. [ ] Redeploy both services

## ✅ **Post-Deployment Verification**

### **Health Checks**
- [ ] Backend health: `https://your-backend-url/health`
  - [ ] Returns 200 status
  - [ ] Shows `"status": "ok"`
  - [ ] Database status shows `"up"` or `"no-db"`

- [ ] Frontend health: `https://your-frontend-url/health`
  - [ ] Returns 200 status
  - [ ] Shows `"status": "ok"`

### **API Connectivity**
- [ ] Frontend can load without console errors
- [ ] API calls from frontend to backend work
- [ ] CORS headers are present in responses
- [ ] No 404 errors for API endpoints

### **Database Connectivity**
- [ ] Database connections are established
- [ ] Health check shows database status
- [ ] No connection timeout errors in logs

## 🚨 **Troubleshooting**

### **Build Failures**
- [ ] Check Railway build logs
- [ ] Verify all dependencies are in package.json
- [ ] Check Dockerfile syntax
- [ ] Ensure build commands are correct

### **Runtime Errors**
- [ ] Check Railway service logs
- [ ] Verify environment variables are set
- [ ] Check database connection strings
- [ ] Verify port binding (should be 0.0.0.0:3000)

### **Health Check Failures**
- [ ] Verify services are binding to correct ports
- [ ] Check if health endpoints exist
- [ ] Verify environment variables are set
- [ ] Check for startup errors in logs

### **CORS Issues**
- [ ] Verify `FRONTEND_URL` and `CORS_ORIGIN` match
- [ ] Check CORS middleware configuration
- [ ] Verify frontend URL is in allowed origins
- [ ] Check browser network tab for CORS errors

## 📊 **Monitoring**

### **Logs to Monitor**
- [ ] Application startup logs
- [ ] Database connection logs
- [ ] Health check logs
- [ ] Error logs
- [ ] Performance metrics

### **Metrics to Track**
- [ ] Response times
- [ ] Error rates
- [ ] Database connection pool status
- [ ] Memory usage
- [ ] CPU usage

## 🎯 **Success Criteria**

- [ ] Both services show "Deployed" status
- [ ] Health checks pass for both services
- [ ] Frontend loads without errors
- [ ] API calls work between services
- [ ] Database connections are established
- [ ] Public URLs are accessible
- [ ] No critical errors in logs

## 📞 **Support**

If you encounter issues:
1. Check Railway documentation
2. Review service logs
3. Run the validation script: `node scripts/validate-railway-deployment.js`
4. Check this checklist for missed steps
5. Verify all environment variables are set correctly

---

**🎉 Once all items are checked, your CaBE Arena application should be successfully deployed on Railway!**
