#!/bin/bash

# CaBE Arena Platform Deployment Script
# This script handles the complete deployment process with testing, building, and monitoring

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOYMENT_ENV="${1:-production}"
BACKUP_DIR="$PROJECT_ROOT/backups/$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$PROJECT_ROOT/logs/deployment_$(date +%Y%m%d_%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

# Create necessary directories
mkdir -p "$(dirname "$LOG_FILE")" "$BACKUP_DIR"

# Function to check prerequisites
check_prerequisites() {
    log "Checking deployment prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    if ! docker info &> /dev/null; then
        error "Docker is not running"
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    # Check if required environment files exist
    if [[ ! -f "$PROJECT_ROOT/.env.$DEPLOYMENT_ENV" ]]; then
        error "Environment file .env.$DEPLOYMENT_ENV not found"
    fi
    
    # Check disk space
    local available_space=$(df "$PROJECT_ROOT" | awk 'NR==2 {print $4}')
    if [[ $available_space -lt 1048576 ]]; then
        warning "Low disk space available: ${available_space}KB"
    fi
    
    success "Prerequisites check completed"
}

# Function to backup current deployment
backup_current_deployment() {
    log "Creating backup of current deployment..."
    
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        # Create database backup
        docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U cabe_user cabe_arena > "$BACKUP_DIR/database_backup.sql" 2>/dev/null || warning "Database backup failed"
        
        # Backup configuration files
        cp -r "$PROJECT_ROOT"/.env* "$BACKUP_DIR/" 2>/dev/null || warning "Environment files backup failed"
        cp -r "$PROJECT_ROOT"/nginx "$BACKUP_DIR/" 2>/dev/null || warning "Nginx config backup failed"
        cp -r "$PROJECT_ROOT"/monitoring "$BACKUP_DIR/" 2>/dev/null || warning "Monitoring config backup failed"
        
        success "Backup created at $BACKUP_DIR"
    else
        log "No running services to backup"
    fi
}

# Function to run tests
run_tests() {
    log "Running test suite..."
    
    cd "$PROJECT_ROOT"
    
    # Run backend tests
    log "Running backend tests..."
    if ! yarn test:backend; then
        error "Backend tests failed"
    fi
    
    # Run frontend tests
    log "Running frontend tests..."
    if ! yarn test:frontend; then
        error "Frontend tests failed"
    fi
    
    # Run integration tests
    log "Running integration tests..."
    if ! yarn test:integration; then
        error "Integration tests failed"
    fi
    
    # Run security audit
    log "Running security audit..."
    if ! yarn audit; then
        warning "Security vulnerabilities found - review required"
    fi
    
    success "All tests passed"
}

# Function to build application
build_application() {
    log "Building application..."
    
    cd "$PROJECT_ROOT"
    
    # Clean previous builds
    log "Cleaning previous builds..."
    yarn clean
    
    # Install dependencies
    log "Installing dependencies..."
    yarn install --frozen-lockfile
    
    # Build backend
    log "Building backend..."
    if ! yarn build:backend; then
        error "Backend build failed"
    fi
    
    # Build frontend
    log "Building frontend..."
    if ! yarn build:frontend; then
        error "Frontend build failed"
    fi
    
    # Build Docker images
    log "Building Docker images..."
    if ! docker-compose -f docker-compose.prod.yml build; then
        error "Docker build failed"
    fi
    
    success "Application built successfully"
}

# Function to deploy application
deploy_application() {
    log "Deploying application to $DEPLOYMENT_ENV environment..."
    
    cd "$PROJECT_ROOT"
    
    # Stop existing services gracefully
    log "Stopping existing services..."
    docker-compose -f docker-compose.prod.yml down --timeout 30 || warning "Graceful shutdown failed, forcing..."
    
    # Start services
    log "Starting services..."
    if ! docker-compose -f docker-compose.prod.yml up -d; then
        error "Service startup failed"
    fi
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if docker-compose -f docker-compose.prod.yml ps | grep -q "healthy"; then
            success "All services are healthy"
            break
        fi
        
        log "Waiting for services to be healthy... (attempt $attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done
    
    if [[ $attempt -gt $max_attempts ]]; then
        error "Services failed to become healthy within expected time"
    fi
    
    # Run database migrations
    log "Running database migrations..."
    if ! docker-compose -f docker-compose.prod.yml exec -T backend yarn db:migrate; then
        error "Database migration failed"
    fi
    
    success "Application deployed successfully"
}

# Function to run health checks
run_health_checks() {
    log "Running health checks..."
    
    local health_endpoints=(
        "http://localhost/health"
        "http://localhost:3001/health"
        "http://localhost:9090/-/healthy"
        "http://localhost:3000/api/health"
    )
    
    for endpoint in "${health_endpoints[@]}"; do
        log "Checking $endpoint..."
        if ! curl -f -s "$endpoint" > /dev/null; then
            error "Health check failed for $endpoint"
        fi
    done
    
    # Check service status
    if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        error "Some services are not running"
    fi
    
    success "All health checks passed"
}

# Function to rollback deployment
rollback_deployment() {
    log "Rolling back deployment..."
    
    cd "$PROJECT_ROOT"
    
    # Stop current services
    docker-compose -f docker-compose.prod.yml down
    
    # Restore from backup if available
    if [[ -d "$BACKUP_DIR" ]]; then
        log "Restoring from backup..."
        
        # Restore database if backup exists
        if [[ -f "$BACKUP_DIR/database_backup.sql" ]]; then
            docker-compose -f docker-compose.prod.yml up -d postgres
            sleep 10
            docker-compose -f docker-compose.prod.yml exec -T postgres psql -U cabe_user -d cabe_arena < "$BACKUP_DIR/database_backup.sql" || warning "Database restore failed"
        fi
        
        # Restore configuration files
        cp -r "$BACKUP_DIR"/.env* . 2>/dev/null || warning "Environment files restore failed"
        cp -r "$BACKUP_DIR"/nginx . 2>/dev/null || warning "Nginx config restore failed"
        cp -r "$BACKUP_DIR"/monitoring . 2>/dev/null || warning "Monitoring config restore failed"
    fi
    
    # Start services with previous configuration
    docker-compose -f docker-compose.prod.yml up -d
    
    success "Rollback completed"
}

# Function to send notifications
send_notification() {
    local status="$1"
    local message="$2"
    
    # Send Slack notification if webhook is configured
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"CaBE Arena Deployment $status: $message\"}" \
            "$SLACK_WEBHOOK_URL" || warning "Slack notification failed"
    fi
    
    # Send email notification if configured
    if [[ -n "${EMAIL_NOTIFICATION:-}" ]]; then
        echo "CaBE Arena Deployment $status: $message" | mail -s "Deployment $status" "$EMAIL_NOTIFICATION" || warning "Email notification failed"
    fi
}

# Main deployment function
main() {
    log "Starting CaBE Arena deployment to $DEPLOYMENT_ENV environment"
    
    # Load environment variables
    if [[ -f "$PROJECT_ROOT/.env.$DEPLOYMENT_ENV" ]]; then
        export $(cat "$PROJECT_ROOT/.env.$DEPLOYMENT_ENV" | grep -v '^#' | xargs)
    fi
    
    # Set up error handling
    trap 'error "Deployment failed at line $LINENO"' ERR
    trap 'rollback_deployment; send_notification "FAILED" "Deployment failed - rollback initiated"' EXIT
    
    # Execute deployment steps
    check_prerequisites
    backup_current_deployment
    run_tests
    build_application
    deploy_application
    run_health_checks
    
    # Remove error handling trap on success
    trap - EXIT
    
    success "Deployment completed successfully"
    send_notification "SUCCESS" "Deployment to $DEPLOYMENT_ENV completed successfully"
    
    # Display deployment information
    log "Deployment Summary:"
    log "- Environment: $DEPLOYMENT_ENV"
    log "- Backup Location: $BACKUP_DIR"
    log "- Log File: $LOG_FILE"
    log "- Services: $(docker-compose -f docker-compose.prod.yml ps --services | wc -l) running"
    log "- Health Status: All services healthy"
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
