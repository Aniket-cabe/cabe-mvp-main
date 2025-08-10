# Nightly Arena Audit CRON Setup Guide

This guide explains how to set up the nightly Arena audit script to run automatically using CRON.

## 🕐 CRON Schedule

The audit script should run every night at 2:00 AM to minimize impact on system performance.

### Basic CRON Setup

```bash
# Edit crontab
crontab -e

# Add this line to run audit every night at 2:00 AM
0 2 * * * cd /path/to/cabe-arena/backend && npm run audit:nightly >> /var/log/arena-audit.log 2>&1
```

### Advanced CRON Setup with Logging

```bash
# Create a wrapper script for better logging
#!/bin/bash
# /path/to/cabe-arena/backend/scripts/run-audit.sh

cd /path/to/cabe-arena/backend
export NODE_ENV=production
export PATH="/usr/local/bin:$PATH"

echo "$(date): Starting nightly Arena audit" >> /var/log/arena-audit.log
npm run audit:nightly >> /var/log/arena-audit.log 2>&1
echo "$(date): Nightly Arena audit completed" >> /var/log/arena-audit.log
```

```bash
# Make the script executable
chmod +x /path/to/cabe-arena/backend/scripts/run-audit.sh

# Add to crontab
0 2 * * * /path/to/cabe-arena/backend/scripts/run-audit.sh
```

## 🔧 Environment Setup

### 1. Environment Variables

Ensure these environment variables are set in your production environment:

```bash
# Database
DATABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Scoring
OPENROUTER_API_KEY=your_openrouter_api_key

# Logging
LOG_LEVEL=info
NODE_ENV=production
```

### 2. Database Tables

Run the SQL script to create the required tables:

```bash
# Connect to your Supabase database and run:
psql -h your-db-host -U your-user -d your-database -f scripts/create-audit-tables.sql
```

## 📊 Monitoring

### 1. Log Monitoring

Monitor the audit logs for any issues:

```bash
# Check recent logs
tail -f /var/log/arena-audit.log

# Check for errors
grep -i error /var/log/arena-audit.log

# Check for critical issues
grep -i critical /var/log/arena-audit.log
```

### 2. Database Monitoring

Query the audit tables to monitor system health:

```sql
-- Check recent audit runs
SELECT
    id,
    started_at,
    completed_at,
    total_submissions,
    passed_count,
    minor_count,
    major_count,
    critical_count,
    average_deviation,
    critical_issues_count,
    status
FROM arena_audit_runs
ORDER BY started_at DESC
LIMIT 10;

-- Check for critical issues
SELECT
    ar.skill_area,
    ar.original_score,
    ar.new_score,
    ar.deviation,
    ar.status,
    ar.timestamp
FROM arena_audit_results ar
WHERE ar.critical_issue = true
ORDER BY ar.timestamp DESC
LIMIT 20;

-- Get trend analysis
SELECT
    DATE(started_at) as audit_date,
    AVG(average_deviation) as avg_deviation,
    SUM(critical_count) as total_critical,
    COUNT(*) as total_runs
FROM arena_audit_runs
WHERE status = 'completed'
GROUP BY DATE(started_at)
ORDER BY audit_date DESC
LIMIT 30;
```

## 🚨 Alerting

### 1. Critical Issues Alert

Set up alerts for critical issues:

```bash
#!/bin/bash
# /path/to/cabe-arena/backend/scripts/check-critical-issues.sh

CRITICAL_COUNT=$(psql -h your-db-host -U your-user -d your-database -t -c "
SELECT COUNT(*) FROM arena_audit_results
WHERE critical_issue = true
AND timestamp > NOW() - INTERVAL '24 hours'
")

if [ "$CRITICAL_COUNT" -gt 0 ]; then
    echo "🚨 CRITICAL: $CRITICAL_COUNT critical scoring issues detected in the last 24 hours" | \
    mail -s "Arena Audit Alert" admin@yourcompany.com
fi
```

### 2. Failed Audit Runs Alert

```bash
#!/bin/bash
# /path/to/cabe-arena/backend/scripts/check-failed-audits.sh

FAILED_COUNT=$(psql -h your-db-host -U your-user -d your-database -t -c "
SELECT COUNT(*) FROM arena_audit_runs
WHERE status = 'failed'
AND started_at > NOW() - INTERVAL '24 hours'
")

if [ "$FAILED_COUNT" -gt 0 ]; then
    echo "❌ FAILED: $FAILED_COUNT audit runs failed in the last 24 hours" | \
    mail -s "Arena Audit Failure" admin@yourcompany.com
fi
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/nightly-audit.yml
name: Nightly Arena Audit

on:
  schedule:
    - cron: '0 2 * * *' # Run at 2:00 AM UTC
  workflow_dispatch: # Allow manual trigger

jobs:
  audit:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: |
          cd backend
          npm ci

      - name: Run nightly audit
        run: |
          cd backend
          npm run audit:nightly
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
          NODE_ENV: production

      - name: Check for critical issues
        run: |
          cd backend
          npm run audit:check-critical
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

## 🧪 Testing

### Manual Test Run

```bash
# Test the audit system manually
cd backend
npm run audit:test

# Run a full audit manually
npm run audit:nightly
```

### Validation Commands

```bash
# Check if tables exist
psql -h your-db-host -U your-user -d your-database -c "\dt arena_audit*"

# Check recent audit runs
psql -h your-db-host -U your-user -d your-database -c "SELECT * FROM arena_audit_runs ORDER BY started_at DESC LIMIT 5;"

# Check for any critical issues
psql -h your-db-host -U your-user -d your-database -c "SELECT COUNT(*) FROM arena_audit_results WHERE critical_issue = true;"
```

## 📈 Performance Considerations

### 1. Resource Usage

- The audit script processes 20 submissions per run
- Each submission requires an AI API call
- Estimated runtime: 2-5 minutes
- Memory usage: ~100MB

### 2. API Rate Limits

- Monitor OpenRouter API usage
- Consider implementing rate limiting if needed
- Add delays between API calls if required

### 3. Database Impact

- Minimal impact on production database
- Uses read-only queries for submissions
- Writes only to audit tables
- Consider running during low-traffic hours

## 🔒 Security

### 1. Access Control

- Audit tables should be read-only for regular users
- Only service role should have write access
- Consider implementing row-level security (RLS)

### 2. Data Privacy

- Audit results contain user and task data
- Ensure compliance with data protection regulations
- Consider data retention policies for audit logs

## 📋 Maintenance

### 1. Log Rotation

```bash
# Add to /etc/logrotate.d/arena-audit
/var/log/arena-audit.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
```

### 2. Data Cleanup

```sql
-- Clean up old audit data (keep last 90 days)
DELETE FROM arena_audit_results
WHERE timestamp < NOW() - INTERVAL '90 days';

DELETE FROM arena_audit_runs
WHERE started_at < NOW() - INTERVAL '90 days';
```

### 3. Health Checks

```bash
#!/bin/bash
# /path/to/cabe-arena/backend/scripts/audit-health-check.sh

# Check if audit ran in the last 24 hours
LAST_AUDIT=$(psql -h your-db-host -U your-user -d your-database -t -c "
SELECT started_at FROM arena_audit_runs
WHERE status = 'completed'
ORDER BY started_at DESC
LIMIT 1
")

if [ -z "$LAST_AUDIT" ]; then
    echo "⚠️ WARNING: No completed audit runs found"
    exit 1
fi

# Check if last audit was within 24 hours
AUDIT_AGE=$(psql -h your-db-host -U your-user -d your-database -t -c "
SELECT EXTRACT(EPOCH FROM (NOW() - started_at))/3600
FROM arena_audit_runs
WHERE status = 'completed'
ORDER BY started_at DESC
LIMIT 1
")

if [ "$AUDIT_AGE" -gt 24 ]; then
    echo "⚠️ WARNING: Last audit was $AUDIT_AGE hours ago"
    exit 1
fi

echo "✅ Audit system is healthy"
```

This setup ensures reliable, monitored, and maintainable nightly audit runs for the Arena scoring system.
