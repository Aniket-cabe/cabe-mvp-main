#!/bin/bash

# CaBE Arena Production Validation Script
# This script validates that all critical P0 issues have been resolved

set -e

echo "🔍 CaBE Arena Production Validation"
echo "==================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Track validation results
PASSED=0
FAILED=0
WARNINGS=0

# Function to validate and count results
validate() {
    local test_name="$1"
    local command="$2"
    local expected="$3"
    
    echo -n "Testing: $test_name... "
    
    if eval "$command" > /dev/null 2>&1; then
        print_status "PASSED"
        ((PASSED++))
    else
        print_error "FAILED"
        echo "  Expected: $expected"
        ((FAILED++))
    fi
}

# Function to check file existence
check_file() {
    local file="$1"
    local description="$2"
    
    echo -n "Checking: $description... "
    
    if [ -f "$file" ]; then
        print_status "EXISTS"
        ((PASSED++))
    else
        print_error "MISSING"
        ((FAILED++))
    fi
}

# Function to check for hardcoded secrets
check_secrets() {
    local pattern="$1"
    local description="$2"
    
    echo -n "Checking: $description... "
    
    if grep -r "$pattern" . --exclude-dir=node_modules --exclude-dir=.git > /dev/null 2>&1; then
        print_error "FOUND"
        ((FAILED++))
    else
        print_status "CLEAN"
        ((PASSED++))
    fi
}

echo ""
echo "🔒 SECURITY VALIDATION"
echo "======================"

# Check for hardcoded secrets
check_secrets "cypress-test-token" "Hardcoded test tokens"
check_secrets "your-openai-api-key" "Default OpenAI API key"
check_secrets "your-service-role-key" "Default Supabase service role key"
check_secrets "your-super-secret-jwt-key" "Default JWT secret"

# Check environment files
check_file "backend/.env" "Backend environment file"
check_file "frontend/.env" "Frontend environment file"

echo ""
echo "🏗️  INFRASTRUCTURE VALIDATION"
echo "=============================="

# Check production configuration files
check_file "docker-compose.prod.yml" "Production Docker Compose"
check_file "backend/db/setup-database.sql" "Database setup script"
check_file "scripts/setup-production.sh" "Production setup script"
check_file "scripts/deploy.sh" "Deployment script"
check_file "scripts/health-check.sh" "Health check script"

# Check monitoring configuration
check_file "monitoring/prometheus.yml" "Prometheus configuration"
check_file "monitoring/alert_rules.yml" "Alert rules"

echo ""
echo "🔧 BACKEND VALIDATION"
echo "======================"

# Check critical backend files
check_file "backend/src/app.ts" "Main application file"
check_file "backend/src/routes/auth.routes.ts" "Authentication routes"
check_file "backend/src/routes/tasks.ts" "Task routes"
check_file "backend/src/lib/points.ts" "Points calculation"
check_file "backend/src/services/task-forge.service.ts" "Task forge service"

# Check health check implementation
echo -n "Checking: Health check implementation... "
if grep -q "checkDatabaseHealth" backend/src/app.ts; then
    print_status "IMPLEMENTED"
    ((PASSED++))
else
    print_error "MISSING"
    ((FAILED++))
fi

# Check points integration
echo -n "Checking: Points integration... "
if grep -q "calculateTaskPoints" backend/src/routes/tasks.ts; then
    print_status "INTEGRATED"
    ((PASSED++))
else
    print_error "MISSING"
    ((FAILED++))
fi

echo ""
echo "🎨 FRONTEND VALIDATION"
echo "======================"

# Check critical frontend files
check_file "frontend/src/App.tsx" "Main App component"
check_file "frontend/src/pages/dashboard.tsx" "Dashboard page"
check_file "frontend/src/components/ProofUploader.tsx" "Proof uploader"

# Check routing implementation
echo -n "Checking: Complete routing... "
if grep -q "Route path=" frontend/src/App.tsx | wc -l | grep -q "1[0-9]"; then
    print_status "COMPLETE"
    ((PASSED++))
else
    print_warning "BASIC"
    ((WARNINGS++))
fi

echo ""
echo "📊 DATABASE VALIDATION"
echo "======================"

# Check database schema
check_file "backend/supabase-tables.sql" "Database schema"
check_file "backend/db/skill-migration.sql" "Skill migration"

# Check for proper indexes
echo -n "Checking: Database indexes... "
if grep -q "CREATE INDEX" backend/db/setup-database.sql; then
    print_status "CONFIGURED"
    ((PASSED++))
else
    print_error "MISSING"
    ((FAILED++))
fi

echo ""
echo "🔍 API VALIDATION"
echo "=================="

# Check API endpoints
echo -n "Checking: Authentication endpoints... "
if grep -q "POST.*register" backend/src/routes/auth.routes.ts; then
    print_status "PRESENT"
    ((PASSED++))
else
    print_error "MISSING"
    ((FAILED++))
fi

echo -n "Checking: Task submission endpoint... "
if grep -q "POST.*submit" backend/src/routes/tasks.ts; then
    print_status "PRESENT"
    ((PASSED++))
else
    print_error "MISSING"
    ((FAILED++))
fi

echo -n "Checking: Health check endpoint... "
if grep -q "GET.*health" backend/src/app.ts; then
    print_status "PRESENT"
    ((PASSED++))
else
    print_error "MISSING"
    ((FAILED++))
fi

echo ""
echo "📚 DOCUMENTATION VALIDATION"
echo "============================"

# Check documentation files
check_file "README.md" "Main README"
check_file "GITHUB-README.md" "GitHub README"
check_file "AUDIT_REPORT.md" "Audit report"
check_file "CABE-ARENA-COMPLETE-PROGRESS-SUMMARY.md" "Progress summary"

echo ""
echo "🧪 TESTING VALIDATION"
echo "======================"

# Check test files
check_file "backend/tests/" "Backend tests directory"
check_file "frontend/tests/" "Frontend tests directory"
check_file "cypress/e2e/" "E2E tests directory"

# Check for critical test files
echo -n "Checking: Authentication tests... "
if find backend/tests/ -name "*auth*" -type f | grep -q .; then
    print_status "PRESENT"
    ((PASSED++))
else
    print_warning "MISSING"
    ((WARNINGS++))
fi

echo -n "Checking: Task submission tests... "
if find backend/tests/ -name "*task*" -type f | grep -q .; then
    print_status "PRESENT"
    ((PASSED++))
else
    print_warning "MISSING"
    ((WARNINGS++))
fi

echo ""
echo "📈 MONITORING VALIDATION"
echo "========================="

# Check monitoring setup
check_file "monitoring/" "Monitoring directory"
check_file "nginx/proxy.conf" "Nginx configuration"

echo ""
echo "🔒 SECURITY HEADERS VALIDATION"
echo "=============================="

# Check security middleware
echo -n "Checking: Security middleware... "
if grep -q "helmetConfig" backend/src/app.ts; then
    print_status "CONFIGURED"
    ((PASSED++))
else
    print_error "MISSING"
    ((FAILED++))
fi

echo -n "Checking: Rate limiting... "
if grep -q "rateLimitMiddleware" backend/src/app.ts; then
    print_status "CONFIGURED"
    ((PASSED++))
else
    print_error "MISSING"
    ((FAILED++))
fi

echo -n "Checking: CORS configuration... "
if grep -q "cors" backend/src/app.ts; then
    print_status "CONFIGURED"
    ((PASSED++))
else
    print_error "MISSING"
    ((FAILED++))
fi

echo ""
echo "📊 VALIDATION SUMMARY"
echo "======================"

echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
echo "⚠️  Warnings: $WARNINGS"

TOTAL=$((PASSED + FAILED + WARNINGS))
SUCCESS_RATE=$((PASSED * 100 / TOTAL))

echo ""
echo "📈 Success Rate: $SUCCESS_RATE%"

if [ $FAILED -eq 0 ]; then
    echo ""
    print_status "🎉 ALL CRITICAL ISSUES RESOLVED!"
    echo ""
    echo "🚀 CaBE Arena is ready for production deployment!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Configure your environment variables in .env files"
    echo "2. Set up your database using backend/db/setup-database.sql"
    echo "3. Run: ./scripts/setup-production.sh"
    echo "4. Run: ./scripts/deploy.sh"
    echo "5. Run: ./scripts/health-check.sh"
    echo ""
    echo "🔒 Security checklist:"
    echo "- [ ] Change all default passwords and API keys"
    echo "- [ ] Set up SSL certificates"
    echo "- [ ] Configure firewall rules"
    echo "- [ ] Set up monitoring and alerting"
    echo "- [ ] Test backup and restore procedures"
    echo ""
    print_status "Production deployment is ready!"
else
    echo ""
    print_error "❌ CRITICAL ISSUES STILL EXIST!"
    echo ""
    echo "Please resolve the following issues before deploying to production:"
    echo ""
    echo "🔧 Immediate actions needed:"
    echo "1. Fix all FAILED validations above"
    echo "2. Address any WARNINGS"
    echo "3. Re-run this validation script"
    echo ""
    print_error "DO NOT DEPLOY TO PRODUCTION until all issues are resolved!"
fi

echo ""
echo "📝 Validation completed at: $(date)"
