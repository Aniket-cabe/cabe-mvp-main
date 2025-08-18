# CaBE Arena Backend

Express.js API backend for the CaBE Arena platform with TypeScript, cluster support, and comprehensive features.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development
npm run dev

# Production build
npm run build

# Start production server
npm start
```

## 📋 Required Environment Variables

### Render Deployment Configuration

The following environment variables must be configured in your Render service:

#### Core Configuration
- `NODE_ENV` - Environment (production/development/test)
- `PORT` - Server port (Render sets this automatically)
- `NODE_VERSION` - Node.js version (18.18.0)

#### Database (Supabase)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `DB_POOL_SIZE` - Database connection pool size (default: 10)

#### AI Services
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `OPENAI_MODEL` - OpenAI model to use (default: gpt-4)
- `OPENROUTER_API_KEY` - OpenRouter API key (optional)

#### External Services
- `AIRTABLE_API_KEY` - Airtable API key (optional)
- `AIRTABLE_BASE_ID` - Airtable base ID (optional)
- `AIRTABLE_TABLE_NAME` - Airtable table name (optional)

#### Security
- `JWT_SECRET` - JWT signing secret (min 32 characters)
- `JWT_EXPIRES_IN` - JWT expiration time (default: 7d)

#### Redis/Caching
- `REDIS_URL` - Redis connection URL (optional)
- `UPSTASH_REDIS_REST_URL` - Upstash Redis REST URL (optional)
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis REST token (optional)

#### Email Configuration
- `SMTP_HOST` - SMTP server host (optional)
- `SMTP_PORT` - SMTP server port (optional)
- `SMTP_USER` - SMTP username (optional)
- `SMTP_PASS` - SMTP password (optional)

#### WebSocket
- `WEBSOCKET_PORT` - WebSocket port (default: 8080)
- `BASE_URL` - Base URL for the application (default: http://localhost:3001)

#### Rate Limiting
- `RATE_LIMIT_WINDOW_MS` - Rate limit window in milliseconds (default: 900000)
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window (default: 100)

#### CORS & Frontend
- `CORS_ORIGIN` - CORS origin URL
- `FRONTEND_URL` - Frontend URL (default: http://localhost:3000)

#### Notifications
- `SLACK_WEBHOOK_URL` - Slack webhook URL for notifications (optional)

#### Feature Flags
- `ENABLE_AI_SCORING` - Enable AI scoring features (default: true)
- `ENABLE_AUDIT_LOGGING` - Enable audit logging (default: true)
- `ENABLE_SLACK_NOTIFICATIONS` - Enable Slack notifications (default: false)

#### Logging
- `LOG_LEVEL` - Log level (error/warn/info/debug, default: info)

#### Cluster Configuration
- `CLUSTER_ENABLED` - Enable cluster mode (default: false)
- `CLUSTER_WORKERS` - Number of cluster workers (default: 4)

## 🏗️ Build Process

The backend uses `tsup` for fast TypeScript compilation:

```bash
npm run build  # Compiles TypeScript to dist/ folder
```

### Build Output
- `dist/cluster.cjs` - Cluster mode entry point
- `dist/index.cjs` - Single process entry point
- Source maps for debugging

## 🚀 Deployment

### Render Deployment
1. Connect your GitHub repository to Render
2. Set root directory to `backend/`
3. Configure build command: `npm install && npm run build`
4. Configure start command: `npm start`
5. Set all required environment variables
6. Deploy!

### Environment Variables Setup
Copy the environment variables list above and configure them in your Render service dashboard.

## 🔧 Development

```bash
# Development with hot reload
npm run dev

# Development with cluster mode
npm run dev:cluster

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📊 Health Check

The backend provides a health check endpoint at `/health` that verifies:
- Database connectivity
- AI service configuration
- Redis connectivity (if configured)
- Overall system status

## 🔒 Security Features

- JWT authentication
- Rate limiting
- CORS protection
- Input validation
- SQL injection prevention
- XSS protection
- Helmet.js security headers

## 📝 API Documentation

API documentation is available at `/api-docs` when running in development mode.

## 🐛 Troubleshooting

### Common Issues

1. **Build fails with TypeScript errors**
   - The build uses `tsup` which transpiles without type checking
   - Run `npm run type-check` to see type errors

2. **Port binding issues**
   - Ensure `PORT` environment variable is set
   - Server binds to `0.0.0.0` for container compatibility

3. **Database connection issues**
   - Verify Supabase credentials
   - Check network connectivity

4. **Environment variable validation**
   - All required env vars must be set
   - Check the validation error messages for missing variables
