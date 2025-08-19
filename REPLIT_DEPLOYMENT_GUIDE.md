# 🚀 CaBE Arena - Replit Deployment Guide

## ✅ **COMPATIBILITY STATUS: 100% READY FOR REPLIT**

Your CaBE Arena project has been fully converted from Yarn to npm and is now 100% compatible with Replit deployment.

## 🔧 **CHANGES MADE**

### **1. Package Manager Conversion**
- ✅ **Root package.json**: Converted from Yarn workspaces to npm workspaces
- ✅ **All scripts**: Updated from `yarn` to `npm` commands
- ✅ **Engine requirements**: Changed from `yarn >=4.0.0` to `npm >=10.0.0`
- ✅ **Workspace commands**: Updated to use `npm run --workspace=` syntax

### **2. Replit Configuration**
- ✅ **.replit**: Updated to use `npm install` and `npm run start:replit`
- ✅ **replit.nix**: Configured for Node.js 20 and npm
- ✅ **Port configuration**: Backend binds to `0.0.0.0` and uses `process.env.PORT`
- ✅ **Frontend Vite**: Configured for `0.0.0.0` binding and port 5000 for preview

### **3. Environment Configuration**
- ✅ **CORS**: Already includes Replit domains (`*.repl.co`, `*.replit.dev`, etc.)
- ✅ **Database**: Configured for SSL and Replit environment detection
- ✅ **Health checks**: Implemented for monitoring deployment status

## 📋 **DEPLOYMENT STEPS**

### **Step 1: Create Replit Project**
1. Go to [replit.com](https://replit.com)
2. Click "Create Repl"
3. Choose "Import from GitHub"
4. Enter your repository URL: `https://github.com/yourusername/cabe-arena-main`

### **Step 2: Configure Environment Variables**
In Replit, go to **Tools → Secrets** and add these variables:

#### **REQUIRED SECRETS:**
```bash
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
OPENAI_API_KEY=sk-your-openai-api-key-here
```

#### **OPTIONAL SECRETS:**
```bash
REDIS_URL=redis://default:password@host:port
DB_POOL_SIZE=10
FORCE_DB_SSL=true
CORS_ORIGINS=https://your-replit-url.repl.co,https://your-replit-url.replit.dev
NODE_ENV=production
PORT=5000
```

### **Step 3: Deploy**
1. Click **Run** in Replit
2. The project will automatically:
   - Install dependencies with `npm install`
   - Build the backend with `npm run build:backend`
   - Start the server with `npm run start:replit`

### **Step 4: Verify Deployment**
1. Check the console for successful startup messages
2. Visit your Replit URL to see the application
3. Test the health endpoint: `https://your-replit-url.repl.co/health`

## 🔍 **VERIFICATION COMMANDS**

### **Check Installation**
```bash
npm --version  # Should show npm version
node --version # Should show Node.js 20+
```

### **Check Build**
```bash
npm run build:backend  # Should build successfully
npm run build:frontend # Should build successfully
```

### **Check Development**
```bash
npm run dev  # Should start both frontend and backend
```

### **Check Production**
```bash
npm run start:replit  # Should start backend only
```

## 📊 **AVAILABLE SCRIPTS**

### **Development Scripts**
```bash
npm run dev              # Start both frontend and backend
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only
npm run dev:cluster      # Start backend with clustering
```

### **Build Scripts**
```bash
npm run build            # Build all workspaces
npm run build:backend    # Build backend only
npm run build:frontend   # Build frontend only
```

### **Test Scripts**
```bash
npm run test             # Run all tests
npm run test:backend     # Run backend tests
npm run test:frontend    # Run frontend tests
npm run test:e2e         # Run end-to-end tests
```

### **Production Scripts**
```bash
npm run start:replit     # Start backend for Replit
npm run start            # Start both frontend and backend
npm run start:backend    # Start backend only
npm run start:frontend   # Start frontend preview
```

## 🌐 **NETWORKING CONFIGURATION**

### **Backend Server**
- **Host**: `0.0.0.0` (binds to all interfaces)
- **Port**: `process.env.PORT` (default: 3000, Replit sets this)
- **CORS**: Configured for Replit domains

### **Frontend Development**
- **Host**: `0.0.0.0` (binds to all interfaces)
- **Port**: `5173` (development)
- **Preview**: `5000` (production build)

## 🔒 **SECURITY CONFIGURATION**

### **CORS Origins**
The application automatically allows:
- `localhost:3000`, `localhost:5173`
- `*.repl.co`, `*.replit.dev`, `*.replit.app`, `*.replit.com`
- Custom origins via `CORS_ORIGINS` environment variable

### **Database Security**
- SSL enabled by default for production
- Connection pooling with configurable size
- Graceful degradation if database is unavailable

### **Rate Limiting**
- Configurable rate limits
- IP-based and user-based limiting
- Graceful handling of rate limit exceeded

## 📈 **MONITORING & HEALTH CHECKS**

### **Health Endpoint**
- **URL**: `/health`
- **Method**: GET
- **Response**: JSON with service status
- **Checks**: Database connectivity, Redis status, uptime

### **Ping Endpoint**
- **URL**: `/health/ping`
- **Method**: GET
- **Response**: Simple pong response

## 🚨 **TROUBLESHOOTING**

### **Common Issues**

#### **1. Port Already in Use**
```bash
# Check what's using the port
lsof -i :3000
# Kill the process
kill -9 <PID>
```

#### **2. Database Connection Issues**
- Verify `DATABASE_URL` is correct
- Check if database is accessible from Replit
- Ensure SSL is properly configured

#### **3. Build Failures**
```bash
# Clean and rebuild
npm run clean
npm install
npm run build:backend
```

#### **4. CORS Issues**
- Check `CORS_ORIGINS` environment variable
- Verify Replit URL is in allowed origins
- Check browser console for CORS errors

### **Logs and Debugging**
- Check Replit console for error messages
- Use `console.log` for debugging (will appear in Replit console)
- Monitor `/health` endpoint for service status

## 📚 **ADDITIONAL RESOURCES**

### **Environment Variables Reference**
See `env.example` file for complete list of available environment variables.

### **Database Setup**
- Use Supabase, Railway, or any PostgreSQL provider
- Ensure SSL is enabled for production
- Configure connection pooling appropriately

### **External Services**
- **Redis**: Optional, for caching and queues
- **OpenAI**: Required for AI features
- **Airtable**: Optional, for data management
- **Email**: Optional, for notifications

## ✅ **FINAL VERIFICATION**

After deployment, verify these endpoints work:

1. **Health Check**: `https://your-replit-url.repl.co/health`
2. **API Status**: `https://your-replit-url.repl.co/api/status`
3. **Frontend**: `https://your-replit-url.repl.co` (if configured)

## 🎉 **SUCCESS!**

Your CaBE Arena project is now fully compatible with Replit and ready for deployment. The conversion from Yarn to npm is complete, and all configurations are optimized for Replit's environment.

**Next Steps:**
1. Deploy to Replit using the steps above
2. Configure your environment variables
3. Test all functionality
4. Share your Replit URL!

---

*For support or questions, check the project documentation or create an issue in the repository.*
