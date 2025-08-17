#!/bin/bash

# CaBE Arena Deployment Test Script
# This script tests the deployment readiness of the application

set -e

echo "🚀 Starting CaBE Arena Deployment Tests..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test results
print_test_result() {
    local test_name="$1"
    local result="$2"
    local message="$3"
    
    if [ "$result" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC} - $test_name: $message"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} - $test_name: $message"
        ((TESTS_FAILED++))
    fi
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check environment variables
check_env_var() {
    local var_name="$1"
    local required="$2"
    
    if [ -z "${!var_name}" ]; then
        if [ "$required" = "true" ]; then
            print_test_result "Environment Variable Check" "FAIL" "Missing required environment variable: $var_name"
            return 1
        else
            print_test_result "Environment Variable Check" "PASS" "Optional environment variable $var_name not set (OK)"
        fi
    else
        print_test_result "Environment Variable Check" "PASS" "Environment variable $var_name is set"
    fi
    return 0
}

echo -e "\n${BLUE}1. Environment Setup Tests${NC}"
echo "---------------------------"

# Check Node.js version
if command_exists node; then
    NODE_VERSION=$(node --version)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1 | tr -d 'v')
    if [ "$NODE_MAJOR" -ge 20 ]; then
        print_test_result "Node.js Version" "PASS" "Node.js $NODE_VERSION (>= 20.0.0)"
    else
        print_test_result "Node.js Version" "FAIL" "Node.js $NODE_VERSION (requires >= 20.0.0)"
    fi
else
    print_test_result "Node.js Installation" "FAIL" "Node.js is not installed"
fi

# Check npm version
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    NPM_MAJOR=$(echo $NPM_VERSION | cut -d. -f1)
    if [ "$NPM_MAJOR" -ge 10 ]; then
        print_test_result "npm Version" "PASS" "npm $NPM_VERSION (>= 10.0.0)"
    else
        print_test_result "npm Version" "FAIL" "npm $NPM_VERSION (requires >= 10.0.0)"
    fi
else
    print_test_result "npm Installation" "FAIL" "npm is not installed"
fi

# Check required environment variables
echo -e "\n${BLUE}2. Environment Variables Tests${NC}"
echo "--------------------------------"

# Required environment variables
check_env_var "AIRTABLE_API_KEY" "true"
check_env_var "AIRTABLE_BASE_ID" "true"
check_env_var "OPENAI_API_KEY" "true"
check_env_var "JWT_SECRET" "true"
check_env_var "SUPABASE_URL" "true"
check_env_var "SUPABASE_ANON_KEY" "true"

# Optional environment variables
check_env_var "NODE_ENV" "false"
check_env_var "PORT" "false"
check_env_var "DATABASE_URL" "false"

echo -e "\n${BLUE}3. Dependencies Installation Tests${NC}"
echo "----------------------------------------"

# Test backend dependencies
echo "Installing backend dependencies..."
cd backend
if npm install --silent; then
    print_test_result "Backend Dependencies" "PASS" "All backend dependencies installed successfully"
else
    print_test_result "Backend Dependencies" "FAIL" "Failed to install backend dependencies"
fi

# Test frontend dependencies
echo "Installing frontend dependencies..."
cd ../frontend
if npm install --silent; then
    print_test_result "Frontend Dependencies" "PASS" "All frontend dependencies installed successfully"
else
    print_test_result "Frontend Dependencies" "FAIL" "Failed to install frontend dependencies"
fi

cd ..

echo -e "\n${BLUE}4. Build Tests${NC}"
echo "--------------"

# Test backend build
echo "Building backend..."
cd backend
if npm run build; then
    print_test_result "Backend Build" "PASS" "Backend built successfully"
else
    print_test_result "Backend Build" "FAIL" "Backend build failed"
fi

# Test frontend build
echo "Building frontend..."
cd ../frontend
if npm run build; then
    print_test_result "Frontend Build" "PASS" "Frontend built successfully"
else
    print_test_result "Frontend Build" "FAIL" "Frontend build failed"
fi

cd ..

echo -e "\n${BLUE}5. Type Checking Tests${NC}"
echo "---------------------------"

# Test backend type checking
echo "Checking backend types..."
cd backend
if npm run type-check; then
    print_test_result "Backend Type Check" "PASS" "Backend type checking passed"
else
    print_test_result "Backend Type Check" "FAIL" "Backend type checking failed"
fi

# Test frontend type checking
echo "Checking frontend types..."
cd ../frontend
if npm run type-check; then
    print_test_result "Frontend Type Check" "PASS" "Frontend type checking passed"
else
    print_test_result "Frontend Type Check" "FAIL" "Frontend type checking failed"
fi

cd ..

echo -e "\n${BLUE}6. Linting Tests${NC}"
echo "---------------------"

# Test backend linting
echo "Linting backend code..."
cd backend
if npm run lint; then
    print_test_result "Backend Linting" "PASS" "Backend linting passed"
else
    print_test_result "Backend Linting" "FAIL" "Backend linting failed"
fi

# Test frontend linting
echo "Linting frontend code..."
cd ../frontend
if npm run lint; then
    print_test_result "Frontend Linting" "PASS" "Frontend linting passed"
else
    print_test_result "Frontend Linting" "FAIL" "Frontend linting failed"
fi

cd ..

echo -e "\n${BLUE}7. Database Connection Tests${NC}"
echo "--------------------------------"

# Test Supabase connection
echo "Testing Supabase connection..."
cd backend
if node -e "
const { createClient } = require('@supabase/supabase-js');
const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
client.from('users').select('count').limit(1).then(() => {
    console.log('Supabase connection successful');
    process.exit(0);
}).catch(err => {
    console.error('Supabase connection failed:', err.message);
    process.exit(1);
});
" 2>/dev/null; then
    print_test_result "Supabase Connection" "PASS" "Successfully connected to Supabase"
else
    print_test_result "Supabase Connection" "FAIL" "Failed to connect to Supabase"
fi

# Test Airtable connection
echo "Testing Airtable connection..."
if node -e "
const Airtable = require('airtable');
const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_ID);
base('Tasks').select({maxRecords: 1}).then(() => {
    console.log('Airtable connection successful');
    process.exit(0);
}).catch(err => {
    console.error('Airtable connection failed:', err.message);
    process.exit(1);
});
" 2>/dev/null; then
    print_test_result "Airtable Connection" "PASS" "Successfully connected to Airtable"
else
    print_test_result "Airtable Connection" "FAIL" "Failed to connect to Airtable"
fi

cd ..

echo -e "\n${BLUE}8. API Endpoint Tests${NC}"
echo "---------------------------"

# Start backend server for testing
echo "Starting backend server for API tests..."
cd backend
npm run start &
BACKEND_PID=$!

# Wait for server to start
sleep 5

# Test API endpoints
echo "Testing API endpoints..."

# Test health check endpoint
if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
    print_test_result "Health Check API" "PASS" "Health check endpoint responding"
else
    print_test_result "Health Check API" "FAIL" "Health check endpoint not responding"
fi

# Test tasks endpoint
if curl -f http://localhost:3000/api/arena/tasks >/dev/null 2>&1; then
    print_test_result "Tasks API" "PASS" "Tasks endpoint responding"
else
    print_test_result "Tasks API" "FAIL" "Tasks endpoint not responding"
fi

# Stop backend server
kill $BACKEND_PID 2>/dev/null || true
cd ..

echo -e "\n${BLUE}9. Docker Tests${NC}"
echo "----------------"

# Test Docker build
echo "Testing Docker build..."
if docker build -t cabe-arena-test . >/dev/null 2>&1; then
    print_test_result "Docker Build" "PASS" "Docker image built successfully"
else
    print_test_result "Docker Build" "FAIL" "Docker build failed"
fi

# Test Docker Compose
echo "Testing Docker Compose..."
if docker-compose config >/dev/null 2>&1; then
    print_test_result "Docker Compose" "PASS" "Docker Compose configuration is valid"
else
    print_test_result "Docker Compose" "FAIL" "Docker Compose configuration is invalid"
fi

echo -e "\n${BLUE}10. Deployment Configuration Tests${NC}"
echo "----------------------------------------"

# Test Vercel configuration
if [ -f "frontend/vercel.json" ]; then
    if node -e "JSON.parse(require('fs').readFileSync('frontend/vercel.json', 'utf8')); console.log('Valid JSON');" >/dev/null 2>&1; then
        print_test_result "Vercel Config" "PASS" "Vercel configuration is valid JSON"
    else
        print_test_result "Vercel Config" "FAIL" "Vercel configuration is invalid JSON"
    fi
else
    print_test_result "Vercel Config" "FAIL" "Vercel configuration file not found"
fi

# Test Render configuration
if [ -f "render.yaml" ]; then
    if node -e "const yaml = require('js-yaml'); yaml.load(require('fs').readFileSync('render.yaml', 'utf8')); console.log('Valid YAML');" >/dev/null 2>&1; then
        print_test_result "Render Config" "PASS" "Render configuration is valid YAML"
    else
        print_test_result "Render Config" "FAIL" "Render configuration is invalid YAML"
    fi
else
    print_test_result "Render Config" "FAIL" "Render configuration file not found"
fi

echo -e "\n${BLUE}11. Security Tests${NC}"
echo "---------------------"

# Test for sensitive data in code
echo "Checking for sensitive data in code..."
if grep -r "password\|secret\|key\|token" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/ | grep -v "process.env" | grep -v "import" | grep -v "//" >/dev/null 2>&1; then
    print_test_result "Sensitive Data Check" "FAIL" "Found potential sensitive data in code"
else
    print_test_result "Sensitive Data Check" "PASS" "No sensitive data found in code"
fi

# Test for proper CORS configuration
if grep -r "cors" --include="*.ts" --include="*.js" backend/src/ >/dev/null 2>&1; then
    print_test_result "CORS Configuration" "PASS" "CORS is configured"
else
    print_test_result "CORS Configuration" "FAIL" "CORS is not configured"
fi

echo -e "\n${BLUE}12. Performance Tests${NC}"
echo "------------------------"

# Test bundle size
echo "Checking frontend bundle size..."
cd frontend
if npm run build >/dev/null 2>&1; then
    BUNDLE_SIZE=$(du -sh dist/ | cut -f1)
    print_test_result "Bundle Size" "PASS" "Frontend bundle size: $BUNDLE_SIZE"
else
    print_test_result "Bundle Size" "FAIL" "Failed to build frontend bundle"
fi
cd ..

echo -e "\n${BLUE}13. Test Suite Tests${NC}"
echo "------------------------"

# Run unit tests
echo "Running unit tests..."
if npm run test:unit >/dev/null 2>&1; then
    print_test_result "Unit Tests" "PASS" "All unit tests passed"
else
    print_test_result "Unit Tests" "FAIL" "Some unit tests failed"
fi

# Run integration tests
echo "Running integration tests..."
if npm run test:integration >/dev/null 2>&1; then
    print_test_result "Integration Tests" "PASS" "All integration tests passed"
else
    print_test_result "Integration Tests" "FAIL" "Some integration tests failed"
fi

echo -e "\n${BLUE}14. Documentation Tests${NC}"
echo "----------------------------"

# Check for required documentation files
REQUIRED_DOCS=("README.md" "DEPLOYMENT.md" "ARCHITECTURE.md")
for doc in "${REQUIRED_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        print_test_result "Documentation" "PASS" "Required documentation file found: $doc"
    else
        print_test_result "Documentation" "FAIL" "Missing required documentation file: $doc"
    fi
done

echo -e "\n${BLUE}15. Final Summary${NC}"
echo "=================="

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
SUCCESS_RATE=$((TESTS_PASSED * 100 / TOTAL_TESTS))

echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo -e "${BLUE}Total Tests: $TOTAL_TESTS${NC}"
echo -e "${YELLOW}Success Rate: $SUCCESS_RATE%${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All deployment tests passed! The application is ready for deployment.${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️  Some deployment tests failed. Please fix the issues before deploying.${NC}"
    exit 1
fi
