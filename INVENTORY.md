# CABE-ARENA REPLIT COMPATIBILITY INVENTORY

## Repository Structure
- **Type**: Monorepo (pnpm workspace)
- **Architecture**: Frontend (React/Vite) + Backend (Express/TypeScript)
- **Package Manager**: pnpm with workspace configuration

## Package Configuration

### Root Package.json
- **Node Version**: >=20.0.0
- **Yarn Version**: >=4.0.0
- **Type**: Not specified (CommonJS default)
- **Scripts**: 
  - `dev`: concurrently runs backend + frontend
  - `build`: builds all workspaces
  - `start`: runs both backend and frontend
  - `test`: runs all workspace tests

### Backend Package.json (@cabe-arena/backend)
- **Node Version**: >=18.18.0 <21
- **Type**: "module" (ESM)
- **Main Entry**: dist/index.js
- **Build Tool**: tsup
- **Key Dependencies**:
  - Express ecosystem (express, cors, helmet, etc.)
  - Database: pg, @supabase/supabase-js, ioredis, redis
  - Authentication: passport, jsonwebtoken, bcryptjs
  - Monitoring: prom-client, express-status-monitor
  - Validation: zod, joi, ajv
  - AI: openai
  - WebSocket: socket.io, ws

### Frontend Package.json (@cabe-arena/frontend)
- **Node Version**: >=20
- **Type**: "module" (ESM)
- **Build Tool**: Vite
- **Framework**: React 18
- **Key Dependencies**:
  - React ecosystem (react, react-dom, react-router-dom)
  - UI: tailwindcss, framer-motion, recharts
  - Forms: react-hook-form, zod
  - Testing: vitest, @testing-library

## Build Configuration

### Backend (tsup.config.ts)
- **Format**: CJS only
- **Target**: node20
- **Entry Points**: src/cluster.ts, src/index.ts
- **Externals**: All major dependencies externalized
- **Issues**: Missing `pg-native` in externals

### Frontend (Vite)
- **Build**: TypeScript + Vite
- **Output**: Static files
- **Dev Server**: Port 5173

## Entry Points

### Backend
- **Main**: src/index.ts (single server)
- **Cluster**: src/cluster.ts (multi-process)
- **Server Binding**: 0.0.0.0:PORT (correct for Replit)
- **Port**: process.env.PORT || env.PORT (3000 default)

### Frontend
- **Dev**: Vite dev server
- **Build**: Static files for production
- **Preview**: Vite preview server

## Database Configuration

### PostgreSQL Pool (backend/db/pool.ts)
- **Driver**: pg (PostgreSQL)
- **Connection**: DATABASE_URL (required)
- **Pool Size**: DB_POOL_SIZE (default: 10)
- **SSL**: { rejectUnauthorized: false } (hardcoded)
- **Status**: ✅ Resilient implementation

### Supabase Integration
- **Client**: @supabase/supabase-js
- **Config**: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY
- **Status**: ⚠️ Mixed usage (both pg and Supabase)

### Redis Configuration
- **Driver**: ioredis, redis
- **URL**: REDIS_URL (optional, defaults to localhost)
- **Status**: ⚠️ No graceful degradation if missing

## Environment Variables

### Required
- DATABASE_URL (PostgreSQL connection string)
- SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY
- JWT_SECRET (min 32 chars)
- OPENAI_API_KEY

### Optional
- DB_POOL_SIZE (default: 10)
- REDIS_URL (default: redis://127.0.0.1:6379)
- CORS_ORIGIN
- NODE_ENV (default: development)
- PORT (default: 3000)

## CORS Configuration

### Current Setup (backend/src/middleware/security.ts)
- **Dynamic**: Uses CORS_ORIGIN env or fallback list
- **Fallback Origins**:
  - localhost:3000, localhost:5173, localhost:4173
  - cabe-arena.com domains
- **Missing**: Replit domains (*.repl.co, *.replit.dev, *.replit.app)

## Security Middleware

### Implemented
- Helmet (security headers)
- CORS
- Rate limiting
- Request size limits
- XSS protection
- SQL injection protection
- CSRF protection

## Monitoring & Health

### Available Endpoints
- `/metrics` (Prometheus)
- `/status` (Express Status Monitor)
- **Missing**: `/health` endpoint

## WebSocket Support

### Configuration
- **Port**: WEBSOCKET_PORT (default: 8080)
- **Libraries**: socket.io, ws
- **Status**: ⚠️ Separate port (not Replit-friendly)

## File System Usage

### Uploads
- **Middleware**: multer
- **Limits**: 5MB files, 1 file per request
- **Status**: ⚠️ No temp directory configuration

## Native Dependencies

### Potential Issues
- **pg**: May include native bindings
- **bcryptjs**: Pure JS implementation (safe)
- **Status**: ⚠️ pg-native not externalized in tsup

## Process Management

### Graceful Shutdown
- **Signals**: SIGTERM, SIGINT handled
- **Status**: ✅ Properly implemented

### Cluster Support
- **Enabled**: CLUSTER_ENABLED env
- **Workers**: CLUSTER_WORKERS (default: 4)
- **Status**: ⚠️ May conflict with Replit single-process model

## Testing Infrastructure

### Backend Tests
- **Framework**: Vitest
- **Types**: Unit, Integration, Security, Performance
- **Coverage**: Available

### Frontend Tests
- **Framework**: Vitest
- **E2E**: Cypress
- **Coverage**: Available

## Deployment Configuration

### Docker
- **Files**: Dockerfile, docker-compose.yml, docker-compose.prod.yml
- **Status**: ✅ Available

### Render
- **File**: render.yaml
- **Status**: ✅ Available

## Critical Issues for Replit

1. **Missing Health Endpoint**: No `/health` route for monitoring
2. **CORS**: Missing Replit domain support
3. **Redis**: No graceful degradation if missing
4. **WebSocket**: Separate port not Replit-friendly
5. **pg-native**: Not externalized in build
6. **Cluster Mode**: May conflict with Replit
7. **File Uploads**: No temp directory configuration
8. **Environment**: Mixed DATABASE_URL vs Supabase config

## Recommendations

1. Add `/health` endpoint
2. Update CORS for Replit domains
3. Implement Redis graceful degradation
4. Configure WebSocket for single port
5. Externalize pg-native in tsup
6. Add temp directory configuration
7. Standardize on DATABASE_URL
8. Disable cluster mode for Replit
