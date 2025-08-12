#!/bin/bash

# CaBE Arena Production Setup Script
# This script sets up the complete production environment

set -e

echo "🚀 CaBE Arena Production Setup"
echo "=============================="

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

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please do not run this script as root"
    exit 1
fi

# Check prerequisites
print_info "Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

print_status "All prerequisites are installed"

# Create production environment file
print_info "Setting up environment configuration..."

if [ ! -f ".env.production" ]; then
    cat > .env.production << EOF
# CaBE Arena Production Environment
# Copy this file to .env and fill in your actual values

# Node Environment
NODE_ENV=production
PORT=3001

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
DB_POOL_SIZE=20

# WebSocket Configuration
WEBSOCKET_PORT=8080

# AI Services
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4

# Security
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-change-this
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Redis Configuration
REDIS_URL=redis://redis:6379

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Slack Integration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url

# Feature Flags
ENABLE_AI_SCORING=true
ENABLE_AUDIT_LOGGING=true
ENABLE_SLACK_NOTIFICATIONS=true

# Logging
LOG_LEVEL=info

# Cluster Configuration
CLUSTER_ENABLED=true
CLUSTER_WORKERS=4

# Frontend Configuration
VITE_API_URL=https://your-domain.com/api
VITE_APP_NAME=CaBE Arena

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000
EOF
    print_status "Created .env.production template"
else
    print_warning ".env.production already exists"
fi

# Create SSL certificates directory
print_info "Setting up SSL configuration..."

mkdir -p nginx/ssl
mkdir -p nginx/logs
mkdir -p logs
mkdir -p uploads

print_status "Created SSL and log directories"

# Create Redis configuration
print_info "Setting up Redis configuration..."

mkdir -p redis
cat > redis/redis.conf << EOF
# Redis Production Configuration
bind 0.0.0.0
port 6379
timeout 300
tcp-keepalive 60
loglevel notice
logfile /data/redis.log
databases 16
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /data
maxmemory 256mb
maxmemory-policy allkeys-lru
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
EOF

print_status "Created Redis configuration"

# Create monitoring configuration
print_info "Setting up monitoring..."

mkdir -p monitoring
cat > monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'cabe-arena-backend'
    static_configs:
      - targets: ['backend:3001']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'cabe-arena-frontend'
    static_configs:
      - targets: ['frontend:80']
    scrape_interval: 30s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
    scrape_interval: 30s
EOF

print_status "Created Prometheus configuration"

# Create alert rules
cat > monitoring/alert_rules.yml << EOF
groups:
  - name: cabe-arena-alerts
    rules:
      - alert: BackendDown
        expr: up{job="cabe-arena-backend"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "CaBE Arena backend is down"
          description: "Backend service has been down for more than 1 minute"

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is above 10% for the last 5 minutes"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is above 2 seconds"

      - alert: LowDiskSpace
        expr: (node_filesystem_avail_bytes * 100) / node_filesystem_size_bytes < 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Low disk space"
          description: "Disk space is below 10%"
EOF

print_status "Created alert rules"

# Create backup script
print_info "Setting up backup configuration..."

cat > scripts/backup.sh << 'EOF'
#!/bin/bash

# CaBE Arena Backup Script
set -e

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="cabe-arena-backup-$DATE"

echo "🔄 Starting backup: $BACKUP_NAME"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup database
echo "📊 Backing up database..."
docker exec cabe-arena-postgres-1 pg_dump -U postgres cabe_arena > "$BACKUP_DIR/$BACKUP_NAME.sql"

# Backup uploads
echo "📁 Backing up uploads..."
tar -czf "$BACKUP_DIR/$BACKUP_NAME-uploads.tar.gz" uploads/

# Backup logs
echo "📝 Backing up logs..."
tar -czf "$BACKUP_DIR/$BACKUP_NAME-logs.tar.gz" logs/

# Create backup manifest
cat > "$BACKUP_DIR/$BACKUP_NAME-manifest.txt" << MANIFEST
CaBE Arena Backup Manifest
==========================
Backup Date: $(date)
Backup Name: $BACKUP_NAME
Files:
- $BACKUP_NAME.sql (Database)
- $BACKUP_NAME-uploads.tar.gz (Uploads)
- $BACKUP_NAME-logs.tar.gz (Logs)

Database Size: $(du -h "$BACKUP_DIR/$BACKUP_NAME.sql" | cut -f1)
Uploads Size: $(du -h "$BACKUP_DIR/$BACKUP_NAME-uploads.tar.gz" | cut -f1)
Logs Size: $(du -h "$BACKUP_DIR/$BACKUP_NAME-logs.tar.gz" | cut -f1)
MANIFEST

echo "✅ Backup completed: $BACKUP_NAME"

# Clean up old backups (keep last 7 days)
find "$BACKUP_DIR" -name "cabe-arena-backup-*" -mtime +7 -delete

echo "🧹 Cleaned up backups older than 7 days"
EOF

chmod +x scripts/backup.sh
print_status "Created backup script"

# Create restore script
cat > scripts/restore.sh << 'EOF'
#!/bin/bash

# CaBE Arena Restore Script
set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup-name>"
    echo "Example: $0 cabe-arena-backup-20241220_143000"
    exit 1
fi

BACKUP_NAME=$1
BACKUP_DIR="/backups"

echo "🔄 Starting restore from: $BACKUP_NAME"

# Check if backup exists
if [ ! -f "$BACKUP_DIR/$BACKUP_NAME.sql" ]; then
    echo "❌ Backup not found: $BACKUP_DIR/$BACKUP_NAME.sql"
    exit 1
fi

# Stop services
echo "⏹️  Stopping services..."
docker-compose -f docker-compose.prod.yml down

# Restore database
echo "📊 Restoring database..."
docker exec -i cabe-arena-postgres-1 psql -U postgres cabe_arena < "$BACKUP_DIR/$BACKUP_NAME.sql"

# Restore uploads
echo "📁 Restoring uploads..."
if [ -f "$BACKUP_DIR/$BACKUP_NAME-uploads.tar.gz" ]; then
    tar -xzf "$BACKUP_DIR/$BACKUP_NAME-uploads.tar.gz"
fi

# Restore logs
echo "📝 Restoring logs..."
if [ -f "$BACKUP_DIR/$BACKUP_NAME-logs.tar.gz" ]; then
    tar -xzf "$BACKUP_DIR/$BACKUP_NAME-logs.tar.gz"
fi

# Start services
echo "▶️  Starting services..."
docker-compose -f docker-compose.prod.yml up -d

echo "✅ Restore completed successfully"
EOF

chmod +x scripts/restore.sh
print_status "Created restore script"

# Create health check script
cat > scripts/health-check.sh << 'EOF'
#!/bin/bash

# CaBE Arena Health Check Script
set -e

echo "🏥 CaBE Arena Health Check"
echo "=========================="

# Check backend health
echo "🔍 Checking backend health..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    exit 1
fi

# Check frontend health
echo "🔍 Checking frontend health..."
if curl -f http://localhost > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
    exit 1
fi

# Check database connection
echo "🔍 Checking database connection..."
if docker exec cabe-arena-postgres-1 pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ Database is healthy"
else
    echo "❌ Database health check failed"
    exit 1
fi

# Check Redis connection
echo "🔍 Checking Redis connection..."
if docker exec cabe-arena-redis-1 redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is healthy"
else
    echo "❌ Redis health check failed"
    exit 1
fi

echo "🎉 All services are healthy!"
EOF

chmod +x scripts/health-check.sh
print_status "Created health check script"

# Create deployment script
cat > scripts/deploy.sh << 'EOF'
#!/bin/bash

# CaBE Arena Deployment Script
set -e

echo "🚀 CaBE Arena Production Deployment"
echo "==================================="

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please copy .env.production to .env and configure it."
    exit 1
fi

# Build and deploy
echo "🔨 Building and deploying services..."

# Pull latest changes
git pull origin main

# Build images
docker-compose -f docker-compose.prod.yml build

# Deploy with zero downtime
echo "🔄 Deploying with zero downtime..."

# Start new containers
docker-compose -f docker-compose.prod.yml up -d

# Wait for health checks
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Run health check
./scripts/health-check.sh

echo "✅ Deployment completed successfully!"
echo "🌐 Application is available at: https://your-domain.com"
EOF

chmod +x scripts/deploy.sh
print_status "Created deployment script"

# Create maintenance script
cat > scripts/maintenance.sh << 'EOF'
#!/bin/bash

# CaBE Arena Maintenance Script
set -e

echo "🔧 CaBE Arena Maintenance Mode"
echo "=============================="

case "$1" in
    "enable")
        echo "🔄 Enabling maintenance mode..."
        # Update nginx to show maintenance page
        cp nginx/maintenance.conf nginx/nginx.conf
        docker-compose -f docker-compose.prod.yml restart nginx
        echo "✅ Maintenance mode enabled"
        ;;
    "disable")
        echo "🔄 Disabling maintenance mode..."
        # Restore normal nginx configuration
        cp nginx/proxy.conf nginx/nginx.conf
        docker-compose -f docker-compose.prod.yml restart nginx
        echo "✅ Maintenance mode disabled"
        ;;
    *)
        echo "Usage: $0 {enable|disable}"
        exit 1
        ;;
esac
EOF

chmod +x scripts/maintenance.sh
print_status "Created maintenance script"

# Create SSL setup script
cat > scripts/setup-ssl.sh << 'EOF'
#!/bin/bash

# CaBE Arena SSL Setup Script
set -e

echo "🔒 CaBE Arena SSL Setup"
echo "======================="

DOMAIN=${1:-"your-domain.com"}

if [ "$DOMAIN" = "your-domain.com" ]; then
    echo "❌ Please provide your domain name"
    echo "Usage: $0 your-domain.com"
    exit 1
fi

echo "🔍 Setting up SSL for domain: $DOMAIN"

# Install certbot if not installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing certbot..."
    sudo apt-get update
    sudo apt-get install -y certbot
fi

# Get SSL certificate
echo "🔐 Obtaining SSL certificate..."
sudo certbot certonly --standalone -d "$DOMAIN" --non-interactive --agree-tos --email admin@$DOMAIN

# Copy certificates to nginx
echo "📁 Copying certificates to nginx..."
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/
sudo chown $USER:$USER nginx/ssl/*.pem

# Update nginx configuration
echo "⚙️  Updating nginx configuration..."
sed -i "s/your-domain.com/$DOMAIN/g" nginx/proxy.conf

echo "✅ SSL setup completed for $DOMAIN"
echo "🔄 Restarting nginx..."
docker-compose -f docker-compose.prod.yml restart nginx

echo "🎉 SSL is now active for https://$DOMAIN"
EOF

chmod +x scripts/setup-ssl.sh
print_status "Created SSL setup script"

print_info "Production setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Copy .env.production to .env and fill in your actual values"
echo "2. Run: ./scripts/setup-ssl.sh your-domain.com"
echo "3. Run: ./scripts/deploy.sh"
echo "4. Run: ./scripts/health-check.sh"
echo ""
echo "📚 Available scripts:"
echo "- ./scripts/deploy.sh - Deploy the application"
echo "- ./scripts/health-check.sh - Check service health"
echo "- ./scripts/backup.sh - Create backup"
echo "- ./scripts/restore.sh <backup-name> - Restore from backup"
echo "- ./scripts/maintenance.sh {enable|disable} - Toggle maintenance mode"
echo ""
echo "🔒 Security notes:"
echo "- Change all default passwords and API keys"
echo "- Set up proper firewall rules"
echo "- Configure SSL certificates"
echo "- Set up monitoring and alerting"
echo ""
print_status "CaBE Arena is ready for production deployment!"
