# Railway Deployment Guide for Cabe Arena

## Overview
This guide provides step-by-step instructions to deploy Cabe Arena on Railway, a modern cloud platform for full-stack applications.

## Prerequisites
- Railway account (sign up at [railway.app](https://railway.app))
- GitHub repository connected to Railway
- PostgreSQL database (Railway provides this)

## Deployment Steps

### 1. Connect Repository to Railway
1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `cabe-arena` repository
4. Railway will automatically detect the project structure

### 2. Configure Backend Service
1. **Build Command**: `npm run railway-build`
2. **Start Command**: Leave empty (Procfile handles this)
3. **Root Directory**: `backend`

### 3. Configure Frontend Service (if separate)
1. **Build Command**: `npm run build`
2. **Output Directory**: `dist`
3. **Root Directory**: `frontend`

### 4. Add PostgreSQL Service
1. In Railway dashboard, click "New Service" → "Database" → "PostgreSQL"
2. This will automatically create a `DATABASE_URL` environment variable
3. Link this database service to your backend service

### 5. Set Environment Variables
Set these in Railway Dashboard → Project → Variables tab:

#### Required Variables:
```bash
# Database (auto-provided by Railway PostgreSQL)
DATABASE_URL=postgresql://...

# Backend
PORT=3001
JWT_SECRET=your_super_secret_jwt_key_here

# Frontend
FRONTEND_URL=https://your-production-domain.railway.app
VITE_API_BASE_URL=https://your-backend-production-domain.railway.app

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### JWT_SECRET Generation:
```bash
# Generate a secure JWT secret
openssl rand -base64 64
```

### 6. Deploy
1. Railway will automatically run the build process
2. Monitor the build logs for any errors
3. Once built, the services will start automatically

### 7. Run Database Migrations
1. Connect to your backend service shell in Railway
2. Run: `npx prisma migrate deploy`
3. Verify database schema is up to date

### 8. Verify Deployment
1. Check backend health: `https://your-backend.railway.app/health`
2. Check frontend: `https://your-frontend.railway.app`
3. Test authentication flow
4. Verify all features (Arena, CaBOT, scoring) work correctly

## Environment-Specific Configurations

### Development
- Uses localhost URLs
- CORS allows localhost:3000
- Database connections point to local instances

### Production (Railway)
- Uses Railway-provided URLs
- CORS restricted to FRONTEND_URL
- Database connections use Railway PostgreSQL
- Environment variables control all configurations

## Troubleshooting

### Common Issues:
1. **Build Failures**: Check build logs for missing dependencies
2. **CORS Errors**: Verify FRONTEND_URL is set correctly
3. **Database Connection**: Ensure DATABASE_URL is properly formatted
4. **Port Binding**: Backend automatically uses Railway's PORT

### Debug Commands:
```bash
# Check environment variables
echo $DATABASE_URL
echo $FRONTEND_URL

# Check service logs
railway logs

# Connect to service shell
railway shell
```

## Security Considerations
- JWT_SECRET should be at least 64 characters
- FRONTEND_URL should be HTTPS in production
- Database connections use SSL by default
- CORS is restricted to specified origins

## Monitoring & Maintenance
- Railway provides built-in monitoring
- Set up alerts for service failures
- Regular database backups (Railway handles this)
- Monitor application performance metrics

## Cost Optimization
- Railway charges per service usage
- Consider using Railway's free tier for development
- Monitor resource usage in dashboard
- Scale services based on actual needs

## Support
- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- Community Discord: [railway.app/discord](https://railway.app/discord)
- GitHub Issues: For project-specific problems
