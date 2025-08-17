#!/bin/bash

# CaBE Arena Master Test Runner
# This script runs all tests and generates a comprehensive report

set -e

echo "🧪 CaBE Arena Comprehensive Test Suite"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test results tracking
declare -A TEST_RESULTS
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test and track results
run_test() {
    local test_name="$1"
    local test_command="$2"
    local test_description="$3"
    
    echo -e "\n${BLUE}Running: $test_name${NC}"
    echo -e "${CYAN}$test_description${NC}"
    echo "----------------------------------------"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASSED${NC}"
        TEST_RESULTS["$test_name"]="PASS"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAILED${NC}"
        TEST_RESULTS["$test_name"]="FAIL"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Function to print test summary
print_summary() {
    echo -e "\n${PURPLE}📊 Test Summary${NC}"
    echo "=================="
    
    for test_name in "${!TEST_RESULTS[@]}"; do
        if [ "${TEST_RESULTS[$test_name]}" = "PASS" ]; then
            echo -e "${GREEN}✅ $test_name${NC}"
        else
            echo -e "${RED}❌ $test_name${NC}"
        fi
    done
    
    echo -e "\n${YELLOW}Overall Results:${NC}"
    echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
    echo -e "${RED}Failed: $FAILED_TESTS${NC}"
    echo -e "${BLUE}Total: $TOTAL_TESTS${NC}"
    
    if [ $TOTAL_TESTS -gt 0 ]; then
        SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
        echo -e "${YELLOW}Success Rate: $SUCCESS_RATE%${NC}"
    fi
}

# Function to generate test report
generate_report() {
    local report_file="test-report-$(date +%Y%m%d-%H%M%S).md"
    
    echo "# CaBE Arena Test Report" > "$report_file"
    echo "Generated: $(date)" >> "$report_file"
    echo "" >> "$report_file"
    
    echo "## Summary" >> "$report_file"
    echo "- Total Tests: $TOTAL_TESTS" >> "$report_file"
    echo "- Passed: $PASSED_TESTS" >> "$report_file"
    echo "- Failed: $FAILED_TESTS" >> "$report_file"
    if [ $TOTAL_TESTS -gt 0 ]; then
        echo "- Success Rate: $((PASSED_TESTS * 100 / TOTAL_TESTS))%" >> "$report_file"
    fi
    echo "" >> "$report_file"
    
    echo "## Detailed Results" >> "$report_file"
    for test_name in "${!TEST_RESULTS[@]}"; do
        if [ "${TEST_RESULTS[$test_name]}" = "PASS" ]; then
            echo "- ✅ $test_name" >> "$report_file"
        else
            echo "- ❌ $test_name" >> "$report_file"
        fi
    done
    
    echo -e "\n${GREEN}📄 Test report generated: $report_file${NC}"
}

# Start time
START_TIME=$(date +%s)

echo -e "\n${PURPLE}Phase 1: Code Quality Tests${NC}"
echo "================================"

# Linting tests
run_test "Backend Linting" "cd backend && npm run lint" "Checking backend code style and quality"
run_test "Frontend Linting" "cd frontend && npm run lint" "Checking frontend code style and quality"

# Type checking tests
run_test "Backend Type Check" "cd backend && npm run type-check" "Checking backend TypeScript types"
run_test "Frontend Type Check" "cd frontend && npm run type-check" "Checking frontend TypeScript types"

# Format checking tests
run_test "Code Format Check" "npm run format:check" "Checking code formatting consistency"

echo -e "\n${PURPLE}Phase 2: Unit Tests${NC}"
echo "====================="

# Backend unit tests
run_test "Backend Unit Tests" "cd backend && npm run test:unit" "Running backend unit tests"
run_test "Frontend Unit Tests" "cd frontend && npm run test:unit" "Running frontend unit tests"

echo -e "\n${PURPLE}Phase 3: Integration Tests${NC}"
echo "=========================="

# Backend integration tests
run_test "Backend Integration Tests" "cd backend && npm run test:integration" "Running backend integration tests"
run_test "Frontend Integration Tests" "cd frontend && npm run test:integration" "Running frontend integration tests"

echo -e "\n${PURPLE}Phase 4: Security Tests${NC}"
echo "======================="

# Security tests
run_test "Backend Security Tests" "cd backend && npm run test:security" "Running backend security tests"

echo -e "\n${PURPLE}Phase 5: Performance Tests${NC}"
echo "========================="

# Performance tests
run_test "Backend Performance Tests" "cd backend && npm run test:performance" "Running backend performance tests"
run_test "Load Tests" "npm run test:load" "Running load tests"
run_test "Advanced Load Tests" "npm run test:load:advanced" "Running advanced load tests"

echo -e "\n${PURPLE}Phase 6: End-to-End Tests${NC}"
echo "=========================="

# E2E tests
run_test "Cypress E2E Tests" "npm run test:e2e" "Running Cypress end-to-end tests"

echo -e "\n${PURPLE}Phase 7: Build Tests${NC}"
echo "====================="

# Build tests
run_test "Backend Build" "cd backend && npm run build" "Building backend application"
run_test "Frontend Build" "cd frontend && npm run build" "Building frontend application"

echo -e "\n${PURPLE}Phase 8: Deployment Tests${NC}"
echo "========================="

# Deployment tests
run_test "Deployment Validation" "bash scripts/test-deployment.sh" "Running deployment validation tests"

echo -e "\n${PURPLE}Phase 9: Coverage Tests${NC}"
echo "======================="

# Coverage tests
run_test "Backend Coverage" "cd backend && npm run test:coverage" "Generating backend test coverage"
run_test "Frontend Coverage" "cd frontend && npm run test:coverage" "Generating frontend test coverage"

echo -e "\n${PURPLE}Phase 10: Smoke Tests${NC}"
echo "====================="

# Smoke tests
run_test "Smoke Tests" "npm run test:smoke" "Running smoke tests"

# End time
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo -e "\n${PURPLE}Phase 11: Test Analysis${NC}"
echo "======================="

# Print summary
print_summary

# Generate report
generate_report

# Performance analysis
echo -e "\n${PURPLE}Performance Analysis${NC}"
echo "======================="
echo -e "${CYAN}Total test duration: ${DURATION} seconds${NC}"

# Check for critical failures
CRITICAL_TESTS=("Backend Build" "Frontend Build" "Backend Unit Tests" "Frontend Unit Tests")
CRITICAL_FAILURES=0

for test in "${CRITICAL_TESTS[@]}"; do
    if [ "${TEST_RESULTS[$test]}" = "FAIL" ]; then
        CRITICAL_FAILURES=$((CRITICAL_FAILURES + 1))
    fi
done

if [ $CRITICAL_FAILURES -gt 0 ]; then
    echo -e "\n${RED}🚨 CRITICAL FAILURES DETECTED!${NC}"
    echo -e "${RED}The following critical tests failed:${NC}"
    for test in "${CRITICAL_TESTS[@]}"; do
        if [ "${TEST_RESULTS[$test]}" = "FAIL" ]; then
            echo -e "${RED}  - $test${NC}"
        fi
    done
    echo -e "\n${YELLOW}⚠️  Please fix critical failures before proceeding with deployment.${NC}"
    exit 1
fi

# Final verdict
if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo -e "${GREEN}The application is ready for deployment.${NC}"
    exit 0
elif [ $CRITICAL_FAILURES -eq 0 ]; then
    echo -e "\n${YELLOW}⚠️  Some non-critical tests failed.${NC}"
    echo -e "${YELLOW}The application may be deployed, but consider fixing the failures.${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Critical tests failed.${NC}"
    echo -e "${RED}The application is not ready for deployment.${NC}"
    exit 1
fi
