#!/bin/bash

# CaBE Arena Backend Build Script for Render
# This script ensures proper Node.js version and handles cross-platform build issues

set -e

echo "🚀 Starting CaBE Arena Backend Build..."

# Check Node.js version
echo "📋 Node.js version: $(node --version)"
echo "📋 NPM version: $(npm --version)"

# Clean dist directory (cross-platform)
echo "🧹 Cleaning dist directory..."
if [ -d "dist" ]; then
    rm -rf dist
    echo "✅ Dist directory cleaned"
else
    echo "ℹ️  Dist directory doesn't exist, skipping clean"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Build the project
echo "🔨 Building project with tsup..."
npm run build

echo "✅ Build completed successfully!"
echo "📁 Build output:"
ls -la dist/
