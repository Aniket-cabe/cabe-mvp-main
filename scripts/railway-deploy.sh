#!/bin/bash

# Railway Deployment Script for Cabe Arena
# This script automates the Railway deployment process

set -e

echo "🚀 Starting Railway deployment for Cabe Arena..."

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build backend
echo "🔨 Building backend..."
cd backend
npm run build
cd ..

# Build frontend
echo "🔨 Building frontend..."
cd frontend
npm run build
cd ..

# Verify builds
echo "✅ Verifying builds..."
if [ ! -d "backend/dist" ]; then
    echo "❌ Backend build failed - dist directory not found"
    exit 1
fi

if [ ! -d "frontend/dist" ]; then
    echo "❌ Frontend build failed - dist directory not found"
    exit 1
fi

echo "✅ All builds completed successfully!"

# Check for Railway CLI
if command -v railway &> /dev/null; then
    echo "🚂 Railway CLI detected"
    echo "📋 Current Railway status:"
    railway status || echo "No active Railway project"
else
    echo "⚠️  Railway CLI not found. Install with: npm install -g @railway/cli"
    echo "📖 Or deploy manually through Railway dashboard"
fi

echo ""
echo "🎉 Railway deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Push these changes to your GitHub repository"
echo "2. Connect your repo to Railway (if not already done)"
echo "3. Set environment variables in Railway dashboard"
echo "4. Deploy your services"
echo ""
echo "📚 See RAILWAY-DEPLOYMENT.md for detailed instructions"
