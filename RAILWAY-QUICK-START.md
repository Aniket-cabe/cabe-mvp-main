# Railway Quick Start Guide

## 🚀 Deploy in 5 Minutes

### 1. Push Changes
```bash
git add .
git commit -m "Add Railway deployment support"
git push origin main
```

### 2. Connect to Railway
- Go to [railway.app](https://railway.app)
- Click "New Project" → "Deploy from GitHub repo"
- Select your `cabe-arena` repository

### 3. Configure Services

#### Backend Service:
- **Build Command**: `npm run railway-build`
- **Start Command**: (leave empty)
- **Root Directory**: `backend`

#### Frontend Service (optional):
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Root Directory**: `frontend`

### 4. Add PostgreSQL
- Click "New Service" → "Database" → "PostgreSQL"
- Link to backend service

### 5. Set Environment Variables
```bash
# Required (set in Railway dashboard)
JWT_SECRET=your_64_char_secret_here
FRONTEND_URL=https://your-frontend.railway.app
VITE_API_BASE_URL=https://your-backend.railway.app
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# Auto-provided by Railway
DATABASE_URL=postgresql://... (auto)
PORT=3001 (auto)
```

### 6. Deploy
- Railway automatically builds and deploys
- Monitor logs for any errors
- Run migrations: `npx prisma migrate deploy`

### 7. Test
- Backend: `https://your-backend.railway.app/health`
- Frontend: `https://your-frontend.railway.app`

## 🔧 Troubleshooting

**Build Fails**: Check build logs, ensure all dependencies are in package.json
**CORS Errors**: Verify FRONTEND_URL is set correctly
**Database Issues**: Check DATABASE_URL format and run migrations
**Port Issues**: Backend automatically uses Railway's PORT

## 📚 Full Documentation
See [RAILWAY-DEPLOYMENT.md](./RAILWAY-DEPLOYMENT.md) for complete details.

## 🎯 What's Been Configured

✅ **Backend Port Binding**: Uses `process.env.PORT || 3001`
✅ **CORS Configuration**: Restricted to FRONTEND_URL
✅ **Build Scripts**: `railway-build` commands added
✅ **Procfile**: Railway deployment commands
✅ **Environment Variables**: All required vars documented
✅ **Deployment Scripts**: Automated setup scripts
✅ **Documentation**: Complete deployment guide

Your project is now 100% Railway-ready! 🎉
