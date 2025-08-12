#!/bin/bash

# CaBE Arena - Quick Fixes Script
# This script applies trivial automated fixes for P0 and P1 issues

set -e

echo "🔧 CaBE Arena - Quick Fixes Script"
echo "=================================="

# Create environment files
echo "📝 Creating environment files..."
if [ ! -f "backend/.env" ]; then
    cp backend/env.example backend/.env
    echo "✅ Created backend/.env"
else
    echo "⚠️  backend/.env already exists"
fi

if [ ! -f "frontend/.env" ]; then
    cp frontend/env.example frontend/.env
    echo "✅ Created frontend/.env"
else
    echo "⚠️  frontend/.env already exists"
fi

# Remove hardcoded secrets from test files
echo "🔒 Removing hardcoded secrets..."
if [ -f "cypress/e2e/websocket.cy.ts" ]; then
    # Replace hardcoded token with environment variable
    sed -i 's/cypress-test-token/\${Cypress.env("TEST_TOKEN")}/g' cypress/e2e/websocket.cy.ts
    echo "✅ Updated hardcoded token in websocket test"
fi

# Add missing .env entries for test tokens
echo "🔧 Adding test token to environment files..."
if ! grep -q "TEST_TOKEN" backend/.env; then
    echo "" >> backend/.env
    echo "# Test Configuration" >> backend/.env
    echo "TEST_TOKEN=test-token-for-cypress" >> backend/.env
    echo "✅ Added TEST_TOKEN to backend/.env"
fi

if ! grep -q "VITE_TEST_TOKEN" frontend/.env; then
    echo "" >> frontend/.env
    echo "# Test Configuration" >> frontend/.env
    echo "VITE_TEST_TOKEN=test-token-for-cypress" >> frontend/.env
    echo "✅ Added VITE_TEST_TOKEN to frontend/.env"
fi

# Update README with missing information
echo "📚 Updating README..."
if [ -f "README.md" ]; then
    # Add missing startup commands if not present
    if ! grep -q "npm run dev" README.md; then
        echo "" >> README.md
        echo "## Quick Start" >> README.md
        echo "" >> README.md
        echo "1. Install dependencies: \`npm ci\`" >> README.md
        echo "2. Set up environment: Copy \`.env.example\` to \`.env\` and fill in values" >> README.md
        echo "3. Start backend: \`cd backend && npm run dev\`" >> README.md
        echo "4. Start frontend: \`cd frontend && npm run dev\`" >> README.md
        echo "✅ Added startup commands to README"
    fi
fi

# Add missing scripts to package.json if they don't exist
echo "📦 Checking package.json scripts..."
if [ -f "package.json" ]; then
    # Check if dev script exists
    if ! grep -q '"dev"' package.json; then
        echo "⚠️  Missing 'dev' script in root package.json"
    fi
    
    # Check if build script exists
    if ! grep -q '"build"' package.json; then
        echo "⚠️  Missing 'build' script in root package.json"
    fi
fi

# Check backend package.json
if [ -f "backend/package.json" ]; then
    if ! grep -q '"dev"' backend/package.json; then
        echo "⚠️  Missing 'dev' script in backend/package.json"
    fi
    
    if ! grep -q '"build"' backend/package.json; then
        echo "⚠️  Missing 'build' script in backend/package.json"
    fi
fi

# Check frontend package.json
if [ -f "frontend/package.json" ]; then
    if ! grep -q '"dev"' frontend/package.json; then
        echo "⚠️  Missing 'dev' script in frontend/package.json"
    fi
    
    if ! grep -q '"build"' frontend/package.json; then
        echo "⚠️  Missing 'build' script in frontend/package.json"
    fi
fi

echo ""
echo "✅ Quick fixes completed!"
echo ""
echo "📋 Next steps:"
echo "1. Fill in actual values in backend/.env and frontend/.env"
echo "2. Run: npm ci"
echo "3. Run: npm run lint"
echo "4. Run: npm run build"
echo "5. Address remaining P0 issues from audit report"
echo ""
echo "⚠️  WARNING: These are only trivial fixes. Critical P0 issues still need manual resolution."
