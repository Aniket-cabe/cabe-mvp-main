#!/bin/bash

# Railway Resilient Build Script for CaBE Arena
# Handles network issues and provides fallbacks

set -e

echo "🚀 Starting Railway resilient build process..."

# Configure registries for better network handling
echo "📡 Configuring package registries..."
yarn config set registry https://registry.npmjs.org/ || true
npm config set registry https://registry.npmjs.org/ || true

# Try yarn install first, fallback to npm
echo "📦 Installing dependencies..."
if yarn install --network-timeout 300000 --network-concurrency 1; then
    echo "✅ Yarn install successful"
else
    echo "⚠️ Yarn install failed, trying npm..."
    if npm install; then
        echo "✅ NPM install successful"
    else
        echo "❌ Both package managers failed"
        exit 1
    fi
fi

# Build backend
echo "🔨 Building backend..."
if yarn build:backend; then
    echo "✅ Backend build successful"
elif npm run build:backend; then
    echo "✅ Backend build successful (npm)"
else
    echo "❌ Backend build failed"
    exit 1
fi

# Build frontend
echo "🌐 Building frontend..."
if yarn build:frontend; then
    echo "✅ Frontend build successful"
elif npm run build:frontend; then
    echo "✅ Frontend build successful (npm)"
else
    echo "❌ Frontend build failed"
    exit 1
fi

# Verify builds
echo "🔍 Verifying builds..."
if [ ! -f "backend/dist/index.js" ]; then
    echo "❌ Backend build output not found"
    exit 1
fi

if [ ! -f "frontend/dist/index.html" ]; then
    echo "❌ Frontend build output not found"
    exit 1
fi

echo "✅ All builds completed successfully!"
echo "📁 Build outputs:"
echo "   Backend: backend/dist/"
echo "   Frontend: frontend/dist/"
