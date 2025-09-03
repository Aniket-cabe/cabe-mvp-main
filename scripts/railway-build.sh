#!/bin/bash

# Railway Build Script for CaBE Arena Backend
# This script handles the build process for Railway deployment

set -e

echo "🚀 Starting Railway build process..."

# Navigate to backend directory
cd backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    yarn install --immutable
fi

# Build the application
echo "🔨 Building backend application..."
yarn build

# Verify build output
if [ ! -f "dist/index.js" ]; then
    echo "❌ Build failed: dist/index.js not found"
    exit 1
fi

echo "✅ Build completed successfully!"
echo "📁 Build output: dist/index.js"

# List build contents
echo "📋 Build contents:"
ls -la dist/
