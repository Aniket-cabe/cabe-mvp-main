# CaBE Arena Backend - Required Environment Variables for Render

This document lists all required environment variables that must be configured in your Render service for the CaBE Arena backend to function properly.

## Required Environment Variables

### Core Configuration
- `NODE_ENV` - Set to `production` for Render
- `PORT` - Automatically set by Render (usually 10000)
- `NODE_VERSION` - Set to `18.18.0` (configured in render.yaml)

### Database (Supabase)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for admin operations)
- `SUPABASE_ANON_KEY` - Supabase anonymous key (for client operations)
- `DB_POOL_SIZE` - Database connection pool size (default: 10)

### AI Services
- `OPENAI_API_KEY` - OpenAI API key for AI scoring and features
- `OPENAI_MODEL` - OpenAI model to use (default: gpt-4)
- `OPENROUTER_API_KEY` - OpenRouter API key (optional)

### Airtable Integration (Optional)
- `AIRTABLE_API_KEY` - Airtable API key
- `AIRTABLE_BASE_ID` - Airtable base ID
- `AIRTABLE_TABLE_NAME` - Airtable table name

### Security
- `JWT_SECRET` - Secret key for JWT token signing (minimum 32 characters)
- `JWT_EXPIRES_IN` - JWT token expiration time (default: 7d)

### Redis (Optional)
- `REDIS_URL` - Redis connection URL
- `UPSTASH_REDIS_REST_URL` - Upstash Redis REST URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis REST token

### WebSocket
- `WEBSOCKET_PORT` - WebSocket server port (default: 8080)
- `BASE_URL` - Base URL for the application (default: http://localhost:3001)

### Rate Limiting
- `RATE_LIMIT_WINDOW_MS` - Rate limit window in milliseconds (default: 900000 - 15 minutes)
- `RATE_LIMIT_MAX_REQUESTS` - Maximum requests per window (default: 100)

### Email Configuration (Optional)
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `FRONTEND_URL` - Frontend URL for email links (default: http://localhost:3000)

### CORS
- `CORS_ORIGIN` - CORS origin (set to your frontend URL)

### Slack Integration (Optional)
- `SLACK_WEBHOOK_URL` - Slack webhook URL for notifications

### Feature Flags
- `ENABLE_AI_SCORING` - Enable AI scoring features (default: true)
- `ENABLE_AUDIT_LOGGING` - Enable audit logging (default: true)
- `ENABLE_SLACK_NOTIFICATIONS` - Enable Slack notifications (default: false)

### Logging
- `LOG_LEVEL` - Log level (error, warn, info, debug) (default: info)

### Cluster Configuration
- `CLUSTER_ENABLED` - Enable clustering (default: false)
- `CLUSTER_WORKERS` - Number of cluster workers (default: 4)

## Render Dashboard Configuration

1. Go to your Render service dashboard
2. Navigate to "Environment" tab
3. Add each environment variable listed above
4. For sensitive data (API keys, secrets), use Render's "Secrets" feature
5. Set `NODE_ENV=production`
6. Set `CORS_ORIGIN` to your frontend URL (e.g., `https://your-app.vercel.app`)

## Important Notes

- **Never commit secrets to Git** - Use Render's environment variables
- **CORS_ORIGIN** must match your frontend URL exactly
- **JWT_SECRET** must be at least 32 characters long
- **SUPABASE keys** are required for database operations
- **OPENAI_API_KEY** is required for AI features

## Testing Environment Variables

After deployment, you can test if all required environment variables are set by checking the application logs. The application will fail to start if any required variables are missing.
