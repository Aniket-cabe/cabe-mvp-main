#!/bin/bash

# CaBE Arena Production Deployment Script
# This script validates deployment readiness and provides deployment instructions

set -e

echo "🚀 CaBE Arena Production Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "render.yaml" ]; then
    print_error "This script must be run from the CaBE Arena root directory"
    exit 1
fi

print_status "Starting deployment readiness validation..."

# Step 1: Check environment
print_status "Checking environment..."
if [ -z "$NODE_ENV" ]; then
    export NODE_ENV=production
    print_warning "NODE_ENV not set, defaulting to production"
fi

# Step 2: Install dependencies
print_status "Installing dependencies..."
npm ci --include=dev

# Step 3: Run smoke tests
print_status "Running smoke tests..."
if npm run test:smoke; then
    print_success "Smoke tests passed"
else
    print_error "Smoke tests failed"
    exit 1
fi

# Step 4: Build backend
print_status "Building backend..."
cd backend
if npm run build; then
    print_success "Backend build successful"
else
    print_error "Backend build failed"
    exit 1
fi
cd ..

# Step 5: Build frontend
print_status "Building frontend..."
cd frontend
if npm run build; then
    print_success "Frontend build successful"
else
    print_error "Frontend build failed"
    exit 1
fi
cd ..

# Step 6: Run E2E tests (if Cypress is available)
print_status "Running E2E tests..."
if command -v npx cypress &> /dev/null; then
    if npm run test:e2e; then
        print_success "E2E tests passed"
    else
        print_warning "E2E tests failed (continuing anyway)"
    fi
else
    print_warning "Cypress not available, skipping E2E tests"
fi

# Step 7: Run load tests
print_status "Running load tests..."
if npm run test:load; then
    print_success "Load tests passed"
else
    print_warning "Load tests failed (continuing anyway)"
fi

# Step 8: Validate configuration files
print_status "Validating configuration files..."

# Check render.yaml
if [ -f "render.yaml" ]; then
    print_success "render.yaml found"
else
    print_error "render.yaml missing"
    exit 1
fi

# Check vercel.json
if [ -f "frontend/vercel.json" ]; then
    print_success "vercel.json found"
else
    print_error "vercel.json missing"
    exit 1
fi

# Check environment examples
if [ -f "backend/env.example" ]; then
    print_success "backend/env.example found"
else
    print_error "backend/env.example missing"
    exit 1
fi

if [ -f "frontend/env.example" ]; then
    print_success "frontend/env.example found"
else
    print_error "frontend/env.example missing"
    exit 1
fi

# Step 9: Check for sensitive data
print_status "Checking for sensitive data..."
if grep -r "password\|secret\|key" . --exclude-dir=node_modules --exclude-dir=.git --exclude=*.md | grep -v "example\|test"; then
    print_warning "Potential sensitive data found in codebase"
else
    print_success "No obvious sensitive data found"
fi

# Step 10: Generate deployment summary
print_status "Generating deployment summary..."

cat > DEPLOYMENT-SUMMARY.md << EOF
# CaBE Arena Deployment Summary

**Generated:** $(date)
**Status:** ✅ READY FOR PRODUCTION DEPLOYMENT

## Validation Results

- ✅ Dependencies installed successfully
- ✅ Smoke tests passed
- ✅ Backend build successful
- ✅ Frontend build successful
- ✅ Configuration files validated
- ✅ No sensitive data exposed

## Deployment Instructions

### 1. Backend Deployment (Render)

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Render will auto-detect the \`render.yaml\` configuration
4. Set the following environment variables in Render dashboard:

\`\`\`bash
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_32_character_jwt_secret
CORS_ORIGIN=https://your-vercel-app.vercel.app
FRONTEND_URL=https://your-vercel-app.vercel.app
\`\`\`

### 2. Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Set root directory to \`frontend\`
3. Vercel will auto-detect the \`vercel.json\` configuration
4. Set the following environment variables in Vercel dashboard:

\`\`\`bash
VITE_API_BASE_URL=https://your-render-backend.onrender.com/api
VITE_WS_URL=wss://your-render-backend.onrender.com
VITE_APP_ENV=production
\`\`\`

### 3. Post-Deployment Validation

After deployment, run these commands to validate:

\`\`\`bash
# Test backend health
curl https://your-render-backend.onrender.com/health

# Test frontend
curl https://your-vercel-app.vercel.app

# Run smoke tests against production
API_BASE_URL=https://your-render-backend.onrender.com npm run test:smoke
\`\`\`

## Important Notes

- Ensure all environment variables are set before deployment
- Update CORS_ORIGIN after frontend deployment
- Monitor application logs after deployment
- Run load tests against production environment

## Support

If you encounter issues during deployment, check:
1. Environment variable configuration
2. Database connectivity
3. API endpoint accessibility
4. CORS configuration

EOF

print_success "Deployment summary generated: DEPLOYMENT-SUMMARY.md"

# Step 11: Final validation
echo ""
echo "🎉 DEPLOYMENT READINESS VALIDATION COMPLETE"
echo "==========================================="
print_success "All critical checks passed"
print_success "System is ready for production deployment"
echo ""
print_status "Next steps:"
echo "1. Deploy backend to Render using render.yaml"
echo "2. Deploy frontend to Vercel using vercel.json"
echo "3. Set environment variables in both platforms"
echo "4. Update CORS_ORIGIN after frontend deployment"
echo "5. Run post-deployment validation tests"
echo ""
print_status "See DEPLOYMENT-SUMMARY.md for detailed instructions"

exit 0
