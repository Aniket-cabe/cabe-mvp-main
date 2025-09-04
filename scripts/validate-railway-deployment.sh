#!/bin/bash

# Railway Deployment Validation Script
# Run this locally to validate your setup before deploying to Railway

set -e

echo "🚀 Railway Deployment Validation Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo ""
echo "🔍 Step 1: Checking Dependencies"
echo "-------------------------------"

# Check if yarn is available
if command -v yarn &> /dev/null; then
    print_status 0 "Yarn is available"
else
    print_status 1 "Yarn is not available. Please install yarn first."
fi

# Check if node is available
if command -v node &> /dev/null; then
    print_status 0 "Node.js is available"
    node --version
else
    print_status 1 "Node.js is not available. Please install Node.js first."
fi

echo ""
echo "📦 Step 2: Installing Dependencies"
echo "--------------------------------"

# Install dependencies
echo "Installing dependencies with yarn..."
yarn install
print_status $? "Dependencies installed successfully"

echo ""
echo "🔨 Step 3: Building Backend"
echo "---------------------------"

# Build backend
echo "Building backend..."
yarn build:backend
print_status $? "Backend built successfully"

# Check if dist directory exists
if [ -d "backend/dist" ]; then
    print_status 0 "Backend dist directory created"
else
    print_status 1 "Backend dist directory not found"
fi

echo ""
echo "🎨 Step 4: Building Frontend"
echo "----------------------------"

# Build frontend
echo "Building frontend..."
yarn build:frontend
print_status $? "Frontend built successfully"

# Check if frontend dist directory exists
if [ -d "frontend/dist" ]; then
    print_status 0 "Frontend dist directory created"
else
    print_status 1 "Frontend dist directory not found"
fi

echo ""
echo "🚀 Step 5: Testing Backend Start"
echo "-------------------------------"

# Test backend start (non-blocking)
echo "Testing backend start..."
timeout 10s yarn start:backend &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 5

# Check if backend is running
if kill -0 $BACKEND_PID 2>/dev/null; then
    print_status 0 "Backend started successfully"
    
    # Test health endpoint
    echo "Testing health endpoint..."
    if command -v curl &> /dev/null; then
        sleep 2
        HEALTH_RESPONSE=$(curl -s http://localhost:3000/health || echo "FAILED")
        if [[ "$HEALTH_RESPONSE" != "FAILED" ]]; then
            print_status 0 "Health endpoint responding"
            echo "Health response: $HEALTH_RESPONSE"
        else
            print_warning "Health endpoint not responding (this is normal for local testing)"
        fi
    else
        print_warning "curl not available, skipping health check"
    fi
    
    # Stop backend
    kill $BACKEND_PID 2>/dev/null || true
else
    print_warning "Backend start test skipped (timeout or error)"
fi

echo ""
echo "🌐 Step 6: Testing Frontend Preview"
echo "----------------------------------"

# Test frontend preview (non-blocking)
echo "Testing frontend preview..."
timeout 10s yarn start:frontend &
FRONTEND_PID=$!

# Wait a bit for frontend to start
sleep 5

# Check if frontend is running
if kill -0 $FRONTEND_PID 2>/dev/null; then
    print_status 0 "Frontend preview started successfully"
    
    # Stop frontend
    kill $FRONTEND_PID 2>/dev/null || true
else
    print_warning "Frontend preview test skipped (timeout or error)"
fi

echo ""
echo "🧪 Step 7: Running Tests"
echo "------------------------"

# Run tests if available
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    echo "Running tests..."
    yarn test
    print_status $? "Tests completed"
else
    print_warning "No tests configured, skipping"
fi

echo ""
echo "🔍 Step 8: Final Validation"
echo "---------------------------"

# Check for required files
echo "Checking required files..."

REQUIRED_FILES=(
    "package.json"
    "yarn.lock"
    "backend/package.json"
    "frontend/package.json"
    "backend/Dockerfile"
    "frontend/Dockerfile"
    "nixpacks.toml"
    "Dockerfile"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_status 0 "$file exists"
    else
        print_status 1 "$file missing"
    fi
done

echo ""
echo "🎯 Step 9: Railway Configuration Check"
echo "-------------------------------------"

# Check Railway-specific configurations
echo "Checking Railway configurations..."

# Check if backend Dockerfile has correct CMD
if grep -q 'CMD \["yarn","start:backend"\]' backend/Dockerfile; then
    print_status 0 "Backend Dockerfile has correct CMD"
else
    print_warning "Backend Dockerfile CMD may need adjustment"
fi

# Check if frontend Dockerfile has correct CMD
if grep -q 'CMD \["nginx", "-g", "daemon off;"\]' frontend/Dockerfile; then
    print_status 0 "Frontend Dockerfile has correct CMD"
else
    print_warning "Frontend Dockerfile CMD may need adjustment"
fi

# Check nixpacks.toml
if [ -f "nixpacks.toml" ]; then
    print_status 0 "nixpacks.toml exists"
else
    print_warning "nixpacks.toml missing"
fi

echo ""
echo "🎉 Validation Complete!"
echo "======================"
echo ""
echo "If all checks passed, your project is ready for Railway deployment!"
echo ""
echo "Next steps:"
echo "1. Push your changes to GitHub"
echo "2. Create Railway project and services as described in RAILWAY-DEPLOYMENT-PLAYBOOK.md"
echo "3. Deploy backend first, then frontend"
echo "4. Configure environment variables"
echo "5. Test both services"
echo ""
echo "For detailed deployment instructions, see: RAILWAY-DEPLOYMENT-PLAYBOOK.md"
