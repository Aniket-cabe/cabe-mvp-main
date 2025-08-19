# Environment Configuration

This document describes the environment configuration system for the Cabe Arena backend.

## 📁 File Structure

```
backend/
├── src/config/
│   └── env.ts              # Environment configuration
├── .env                    # Environment variables (not in git)
├── env.example             # Example environment file
└── ENVIRONMENT.md          # This documentation
```

## 🔧 Required Environment Variables

### Database Configuration

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Purpose**: Connect to Supabase database with admin privileges.

### External APIs

```env
AIRTABLE_API_KEY=your-airtable-api-key-here
AIRTABLE_BASE_ID=your-airtable-base-id-here
AIRTABLE_TABLE_NAME=your-airtable-table-name-here
```

**Purpose**: Connect to Airtable for data integration.

```env
OPENROUTER_API_KEY=your-openrouter-api-key-here
```

**Purpose**: Access OpenRouter AI API for generating AI responses.

### Application Settings

```env
NODE_ENV=development
PORT=3001
LOG_LEVEL=info
```

**Purpose**: Configure application behavior and logging.

## 🚀 Setup Instructions

### 1. Create Environment File

Copy the example file:

```bash
cp env.example .env
```

### 2. Fill in Your Values

Edit `.env` with your actual values:

```env
# Node Environment
NODE_ENV=development
PORT=3001
LOG_LEVEL=info

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Airtable Configuration
AIRTABLE_API_KEY=your-airtable-api-key-here
AIRTABLE_BASE_ID=your-airtable-base-id-here
AIRTABLE_TABLE_NAME=your-airtable-table-name-here

# OpenRouter AI Configuration
OPENROUTER_API_KEY=your-openrouter-api-key-here
```

### 3. Validate Configuration

The application will validate all required variables on startup:

```bash
npm run dev:backend
```

## 🔑 Getting API Keys

### Supabase

1. **Create a project** at [Supabase](https://supabase.com/)
2. **Go to Settings > API**
3. **Copy the URL** and **Service Role Key**
4. **Add to `.env`**

### Airtable

1. **Create an account** at [Airtable](https://airtable.com/)
2. **Go to Account > API**
3. **Generate an API key**
4. **Get your Base ID** from the API documentation
5. **Add to `.env`**

### OpenRouter

1. **Sign up** at [OpenRouter](https://openrouter.ai/)
2. **Add credits** to your account
3. **Generate an API key** in your dashboard
4. **Add to `.env`**

## 📊 Environment-Specific Behavior

### Development Mode (`NODE_ENV=development`)

- **Detailed Logging**: Full request/response logging
- **Error Details**: Exposed error messages in responses
- **Hot Reload**: Automatic server restart on file changes
- **Debug Info**: Startup information displayed

### Production Mode (`NODE_ENV=production`)

- **Minimal Logging**: Only essential logs
- **Generic Errors**: No sensitive error details exposed
- **Performance**: Optimized for production use
- **Security**: Enhanced security headers

### Test Mode (`NODE_ENV=test`)

- **Test Database**: Uses test-specific database
- **Mock Services**: External APIs may be mocked
- **Fast Execution**: Optimized for test speed

## 🔒 Security Best Practices

### 1. Never Commit Secrets

```bash
# ✅ Good: .env is in .gitignore
# ❌ Bad: Never commit actual API keys
```

### 2. Use Different Keys per Environment

```env
# Development
SUPABASE_URL=https://dev-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=dev-key-here

# Production
SUPABASE_URL=https://prod-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=prod-key-here
```

### 3. Rotate Keys Regularly

- **Monthly**: Review and rotate API keys
- **Security Incidents**: Rotate immediately if compromised
- **Employee Changes**: Rotate when team members leave

### 4. Monitor Usage

- **API Limits**: Monitor rate limits and usage
- **Cost Tracking**: Track API usage costs
- **Error Rates**: Monitor for unusual error patterns

## 🧪 Testing

### Environment Validation

The application validates all required variables on startup:

```typescript
// This will exit with error if validation fails
import { env } from './config/env';
```

### Test Environment

For testing, you can use:

```env
NODE_ENV=test
SUPABASE_URL=https://test-project.supabase.co
# ... other test-specific values
```

## 🔍 Troubleshooting

### Common Issues

1. **"Environment validation failed"**
   - Check all required variables are set
   - Verify variable names match exactly
   - Ensure no extra spaces or quotes

2. **"Cannot find module"**
   - Run `npm install` to install dependencies
   - Check Node.js version compatibility

3. **"API key invalid"**
   - Verify API key is correct
   - Check if key has required permissions
   - Ensure key hasn't expired

4. **"Connection timeout"**
   - Check internet connection
   - Verify firewall settings
   - Check service status pages

### Debug Mode

Enable detailed logging:

```env
LOG_LEVEL=debug
NODE_ENV=development
```

This will show:

- Environment variable loading
- API connection attempts
- Detailed error messages
- Request/response logging

## 📈 Monitoring

### Environment Health Checks

The application includes health check endpoints:

```bash
# Basic health check
curl http://localhost:3001/health

# API status
curl http://localhost:3001/api/status

# Supabase connection test
curl http://localhost:3001/api/supabase/test

# AI connection test
curl http://localhost:3001/api/test/ai/generate
```

### Log Monitoring

Monitor these log patterns:

- **Startup**: Environment loading and validation
- **API Calls**: External service connections
- **Errors**: Failed requests and timeouts
- **Performance**: Response times and usage stats

## 🔄 Environment Updates

### Adding New Variables

1. **Update Schema**: Add to `envSchema` in `env.ts`
2. **Update Example**: Add to `env.example`
3. **Update Documentation**: Add to this file
4. **Test**: Verify validation works

### Example Addition

```typescript
// In env.ts
const envSchema = z.object({
  // ... existing variables
  NEW_API_KEY: z.string().min(1, 'NEW_API_KEY is required'),
});

// In env.example
NEW_API_KEY=your-new-api-key-here

// In this documentation
## New Service
NEW_API_KEY - API key for new service
```
