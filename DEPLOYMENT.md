# CaBE Arena Deployment Guide

This guide provides complete deployment instructions for the CaBE Arena monorepo on Render (backend) and Vercel (frontend).

## Backend Deployment (Render)

### Render Service Settings

**Root Directory:** `backend`

**Build Command:** `npm ci --include=dev && npm run build`

**Start Command:** `npm start`

**Node Version:** `20` (set via environment variable `NODE_VERSION=20`)

### Required Environment Variables

```bash
NODE_ENV=production
OPENAI_API_KEY=your_openai_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here
JWT_SECRET=your_32_character_jwt_secret_here
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

### Optional Environment Variables

```bash
# Redis (choose one)
REDIS_URL=rediss://your-redis-url
# OR Upstash REST
UPSTASH_REDIS_REST_URL=https://your-upstash-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# Airtable (optional)
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_base_id
AIRTABLE_TABLE_NAME=your_table_name

# Email (optional)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# Slack (optional)
SLACK_WEBHOOK_URL=your_slack_webhook_url

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Integration (optional)
INTEGRATION_SIGNING_SECRET=your_integration_secret
```

### Health Check

The backend provides a health endpoint at `/health` that returns:
```json
{
  "ok": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Frontend Deployment (Vercel)

### Vercel Project Settings

**Root Directory:** `frontend`

**Install Command:** `npm install` (or leave blank for auto-detection)

**Build Command:** `npm run build`

**Output Directory:** `dist`

### Required Environment Variables

```bash
VITE_API_BASE_URL=https://your-render-backend.onrender.com/api
VITE_WS_URL=wss://your-render-backend.onrender.com
```

### Build Output

The frontend builds to the `dist` directory and serves static files.

## Deployment Steps

### 1. Backend (Render)

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set the root directory to `backend`
4. Configure the build and start commands as specified above
5. Add all required environment variables
6. Deploy

### 2. Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set the root directory to `frontend`
3. Configure the build settings as specified above
4. Add the required environment variables
5. Deploy

### 3. Update CORS

After both deployments are complete:
1. Update the `CORS_ORIGIN` environment variable in Render to match your Vercel domain
2. Redeploy the backend

## Troubleshooting

### Backend Issues

- **Build fails:** Ensure all dev dependencies are installed with `--include=dev`
- **Environment validation fails:** Check that all required environment variables are set
- **CORS errors:** Verify `CORS_ORIGIN` matches your frontend domain exactly
- **Redis connection fails:** Check Redis URL format or Upstash credentials

### Frontend Issues

- **Build fails:** Ensure all dependencies are properly installed
- **API calls fail:** Verify `VITE_API_BASE_URL` points to the correct backend URL
- **WebSocket fails:** Verify `VITE_WS_URL` points to the correct backend URL

### Health Check

Test the backend health endpoint:
```bash
curl https://your-render-backend.onrender.com/health
```

Expected response:
```json
{"ok":true,"timestamp":"2024-01-01T00:00:00.000Z"}
```

## Security Notes

- Never commit environment variables to the repository
- Use strong, unique JWT secrets (32+ characters)
- Enable HTTPS for all production deployments
- Regularly rotate API keys and secrets
- Monitor application logs for security issues

## Performance Optimization

- Enable compression on the backend
- Use CDN for static assets
- Implement proper caching headers
- Monitor response times and error rates
- Use Redis for session storage and caching

## Monitoring

- Set up logging for both frontend and backend
- Monitor error rates and response times
- Set up alerts for critical failures
- Track user activity and performance metrics
