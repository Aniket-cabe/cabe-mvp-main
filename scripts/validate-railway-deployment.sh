#!/bin/bash

# Railway Deployment Validation Script
# Tests local builds and provides validation commands

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
    local status=$1
    local message=$2
    if [ "$status" = "success" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "error" ]; then
        echo -e "${RED}❌ $message${NC}"
    elif [ "$status" = "warning" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    fi
}

echo ""
echo "📋 Step 1: Validate Dependencies"
echo "--------------------------------"

# Check if yarn is available
if command -v yarn &> /dev/null; then
    print_status "success" "Yarn is available"
    yarn --version
else
    print_status "error" "Yarn is not installed. Please install yarn first."
    exit 1
fi

# Check if node is available
if command -v node &> /dev/null; then
    print_status "success" "Node.js is available"
    node --version
else
    print_status "error" "Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo ""
echo "📦 Step 2: Install Dependencies"
echo "-------------------------------"

# Install dependencies
if yarn install; then
    print_status "success" "Dependencies installed successfully"
else
    print_status "error" "Failed to install dependencies"
    exit 1
fi

echo ""
echo "🔨 Step 3: Build Backend"
echo "------------------------"

# Build backend
if yarn build:backend; then
    print_status "success" "Backend built successfully"
    
    # Check if dist folder exists
    if [ -d "backend/dist" ]; then
        print_status "success" "Backend dist folder created"
        ls -la backend/dist/
    else
        print_status "error" "Backend dist folder not found"
        exit 1
    fi
else
    print_status "error" "Backend build failed"
    exit 1
fi

echo ""
echo "🌐 Step 4: Build Frontend"
echo "-------------------------"

# Build frontend
if yarn build:frontend; then
    print_status "success" "Frontend built successfully"
    
    # Check if dist folder exists
    if [ -d "frontend/dist" ]; then
        print_status "success" "Frontend dist folder created"
        ls -la frontend/dist/
    else
        print_status "error" "Frontend dist folder not found"
        exit 1
    fi
else
    print_status "error" "Frontend build failed"
    exit 1
fi

echo ""
echo "🧪 Step 5: Test Backend Start"
echo "-----------------------------"

# Test backend start (background)
echo "Starting backend in background..."
yarn start:backend &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Check if backend is running
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    print_status "success" "Backend started successfully and health check passed"
else
    print_status "error" "Backend health check failed"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Stop backend
kill $BACKEND_PID 2>/dev/null || true

echo ""
echo "🎯 Step 6: Validation Summary"
echo "----------------------------"

print_status "success" "All validation steps passed!"
echo ""
echo "📋 Railway Deployment Ready Checklist:"
echo "✅ Dependencies installed"
echo "✅ Backend builds successfully"
echo "✅ Frontend builds successfully"
echo "✅ Backend starts and health check passes"
echo "✅ All yarn scripts working"
echo ""
echo "🚀 Next Steps:"
echo "1. Follow the RAILWAY-DEPLOYMENT-PLAYBOOK.md"
echo "2. Create Railway project and services"
echo "3. Set environment variables"
echo "4. Deploy backend first, then frontend"
echo "5. Test integration between services"
echo ""
echo "🔧 Local Testing Commands:"
echo "yarn build:backend     # Build backend"
echo "yarn build:frontend    # Build frontend"
echo "yarn start:backend     # Start backend locally"
echo "yarn start:frontend    # Preview frontend locally"
echo ""
echo "🎉 Your CaBE Arena application is ready for Railway deployment!"
