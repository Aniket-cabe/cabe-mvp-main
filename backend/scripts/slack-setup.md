# Slack Integration Setup Guide for Arena Audit System

This guide explains how to set up Slack webhook notifications for the Arena nightly audit system.

## 🚀 Quick Setup

### 1. Create Slack App and Webhook

1. **Go to [api.slack.com/apps](https://api.slack.com/apps)**
2. **Click "Create New App"**
3. **Choose "From scratch"**
4. **Enter app name: "Arena Audit Notifications"**
5. **Select your workspace**

### 2. Configure Incoming Webhooks

1. **In your app settings, go to "Incoming Webhooks"**
2. **Toggle "Activate Incoming Webhooks" to On**
3. **Click "Add New Webhook to Workspace"**
4. **Select the channel where you want notifications (e.g., #arena-audits)**
5. **Click "Allow"**
6. **Copy the webhook URL** (starts with `https://hooks.slack.com/services/...`)

### 3. Environment Configuration

Add the webhook URL to your environment variables:

```bash
# .env file
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
FRONTEND_URL=https://cabe.ai  # Optional: for direct links to audit reports
```

## 📋 Notification Types

### 🚨 Alert Notifications (Critical Issues)

**Triggered when:**

- Critical issues detected (deviation > 15 points)
- Average deviation > 10 points
- Audit run failed
- High number of major issues (>30% of submissions)

**Example Alert:**

```
🚨 Arena Nightly Audit Alert 🚨
• Run ID: audit_2024-08-01_1234567890
• Deviation: 11.4 📈
• Critical Issues: 2 ❗
• Status: 🔴 Immediate Action Required
```

### 📊 Summary Notifications (All Audits)

**Sent for every completed audit run with:**

- Total submissions processed
- Breakdown by status (passed, minor, major, critical)
- Average deviation
- Skill area breakdown
- Direct link to full report

### 🏥 Health Check Notifications

**System health monitoring:**

- Healthy: All systems operational
- Warning: Minor issues detected
- Critical: System failure

## 🔧 Advanced Configuration

### Custom Channel Setup

Create different webhooks for different notification types:

```bash
# Separate channels for different severity levels
SLACK_WEBHOOK_URL_CRITICAL=https://hooks.slack.com/services/.../critical
SLACK_WEBHOOK_URL_WARNING=https://hooks.slack.com/services/.../warnings
SLACK_WEBHOOK_URL_INFO=https://hooks.slack.com/services/.../info
```

### Message Customization

The notification system supports rich Slack messages with:

- **Headers** with emoji indicators
- **Fields** with structured data
- **Action buttons** linking to audit reports
- **Context** with timestamps
- **Attachments** with color coding

### Alert Thresholds

Default alert thresholds (can be customized in code):

```typescript
// Alert conditions
const criticalIssues = summary.criticalCount > 0;
const highDeviation = summary.averageDeviation > 10;
const auditFailed = summary.status === 'failed';
const highMajorIssues = summary.majorCount > summary.totalSubmissions * 0.3;
```

## 🧪 Testing

### Test Webhook Connectivity

```bash
# Test basic connectivity
npm run slack:test

# Or test specific functions
cd backend
tsx scripts/test-slack-notifications.ts
```

### Manual Testing

```bash
# Test simple message
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"🧪 Test message from Arena Audit System"}' \
  https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Test Audit Scenarios

The test script covers:

1. **Webhook connectivity**
2. **Simple messages**
3. **Audit summaries**
4. **Critical alerts**
5. **Warning alerts**
6. **Failed audit alerts**
7. **Normal audits (no alert)**
8. **Health check notifications**

## 📊 Message Examples

### Critical Alert Example

```
🚨 Arena Nightly Audit Alert 🚨

Run ID: audit_2024-08-01_1234567890
Status: 🔴 Immediate Action Required
Total Submissions: 20
Average Deviation: 15.2 points
Critical Issues: 3
Major Issues: 4

FRONTEND: 5 submissions, 18.2 avg deviation
BACKEND: 5 submissions, 22.8 avg deviation
CONTENT: 5 submissions, 12.4 avg deviation
DATA: 5 submissions, 7.6 avg deviation

[View Full Report] button
```

### Normal Summary Example

```
📊 Arena Nightly Audit Complete

Run ID: audit_2024-08-01_9876543210
Results: 18 ✅ 2 ⚠️ 0 🔶 0 ❗
Metrics: 3.2 avg deviation, 20 total

[View Report] button
```

### Failed Audit Example

```
🚨 Arena Nightly Audit Alert 🚨

Run ID: audit_2024-08-01_555666777
Status: 🔴 Immediate Action Required
Error: Database connection timeout during audit execution

[View Full Report] button
```

## 🔒 Security Considerations

### Webhook URL Security

- **Keep webhook URLs secret** - they provide full access to post to your channel
- **Use environment variables** - never hardcode in source code
- **Rotate webhooks** - change webhook URLs periodically
- **Monitor usage** - check Slack app analytics for unusual activity

### Channel Access Control

- **Use private channels** for sensitive audit data
- **Limit channel membership** to relevant team members
- **Consider separate channels** for different severity levels

### Rate Limiting

Slack has rate limits:

- **Tier 1 apps**: 1 message per second
- **Tier 2 apps**: 50 messages per second
- **Tier 3 apps**: 100 messages per second

The audit system respects these limits and includes error handling.

## 🚨 Troubleshooting

### Common Issues

#### Webhook URL Invalid

```
❌ Slack webhook test failed. Please check SLACK_WEBHOOK_URL configuration.
```

**Solution:** Verify the webhook URL is correct and active

#### Channel Not Found

```
❌ Slack webhook failed: HTTP 404: channel_not_found
```

**Solution:** Check that the channel exists and the app has permission to post

#### Rate Limited

```
❌ Slack webhook failed: HTTP 429: rate_limited
```

**Solution:** Wait and retry, or upgrade Slack app tier

#### Permission Denied

```
❌ Slack webhook failed: HTTP 403: forbidden
```

**Solution:** Check app permissions and channel access

### Debug Mode

Enable debug logging:

```bash
# Set debug environment variable
LOG_LEVEL=debug npm run slack:test
```

### Manual Verification

1. **Check webhook URL** in Slack app settings
2. **Verify channel permissions** for the app
3. **Test with curl** to isolate issues
4. **Check app logs** for detailed error messages

## 📈 Monitoring

### Slack App Analytics

Monitor your Slack app usage:

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Select your Arena Audit app
3. View "Analytics" tab
4. Monitor message volume and error rates

### Audit System Logs

The audit system logs all notification attempts:

```bash
# Check notification logs
grep -i "slack" /var/log/arena-audit.log

# Check for notification failures
grep -i "failed.*slack" /var/log/arena-audit.log
```

### Health Checks

Set up automated health checks:

```bash
# Test webhook connectivity daily
0 6 * * * cd /path/to/cabe-arena/backend && npm run slack:test >> /var/log/slack-health.log 2>&1
```

## 🔄 Integration with CRON

### Enhanced CRON Setup

```bash
#!/bin/bash
# /path/to/cabe-arena/backend/scripts/run-audit-with-slack.sh

cd /path/to/cabe-arena/backend
export NODE_ENV=production
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

echo "$(date): Starting nightly Arena audit with Slack notifications" >> /var/log/arena-audit.log
npm run audit:nightly >> /var/log/arena-audit.log 2>&1

# Check if audit completed successfully
if [ $? -eq 0 ]; then
    echo "$(date): Audit completed successfully" >> /var/log/arena-audit.log
else
    echo "$(date): Audit failed - Slack notification should have been sent" >> /var/log/arena-audit.log
fi
```

### CRON Schedule

```bash
# Run audit nightly at 2:00 AM with Slack notifications
0 2 * * * /path/to/cabe-arena/backend/scripts/run-audit-with-slack.sh
```

## 🎯 Best Practices

### 1. Channel Organization

- **#arena-audits** - All audit notifications
- **#arena-alerts** - Critical issues only
- **#arena-health** - System health checks

### 2. Notification Timing

- **Immediate alerts** for critical issues
- **Daily summaries** for all completed audits
- **Weekly health reports** for system status

### 3. Message Clarity

- **Use emojis** for quick visual identification
- **Include action buttons** for easy access to reports
- **Provide context** with timestamps and run IDs
- **Structure data** in readable fields

### 4. Error Handling

- **Graceful degradation** when Slack is unavailable
- **Retry logic** for transient failures
- **Fallback logging** for all notification attempts
- **Health monitoring** for webhook connectivity

This setup ensures reliable, informative, and actionable Slack notifications for the Arena audit system! 🚀
