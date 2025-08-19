# REPLIT COMPATIBILITY CHECKLIST

## PHASE 1 - ANALYSIS RESULTS

### A) Node Version ✅
- **Status**: ✅ PASS
- **Details**: 
  - Root: >=20.0.0
  - Backend: >=18.18.0 <21
  - Frontend: >=20
- **File**: package.json, backend/package.json, frontend/package.json
- **Action**: No changes needed

### B) Single Exposed Server Port ✅
- **Status**: ✅ PASS
- **Details**: 
  - Uses `process.env.PORT || env.PORT` (3000 default)
  - Binds on `0.0.0.0` (correct for Replit)
- **File**: backend/src/index.ts:4, backend/src/index.ts:6
- **Action**: No changes needed

### C) Start Script(s) ⚠️
- **Status**: ⚠️ PARTIAL
- **Details**: 
  - Has `start` but runs both backend + frontend
  - Missing `start:replit` script
- **File**: package.json:35-37
- **Action**: Add `start:replit` script for backend only

### D) Monorepo Handling ⚠️
- **Status**: ⚠️ NEEDS DECISION
- **Details**: 
  - Current: Runs both backend + frontend via concurrently
  - Replit constraint: Single exposed port
- **Options**:
  1. **Backend only on Replit** (recommended)
  2. **Backend + Next.js via proxy** (complex)
- **Recommendation**: Backend only, frontend on separate Replit or Vercel
- **Action**: Create backend-only start script

### E) Environment Handling ⚠️
- **Status**: ⚠️ PARTIAL
- **Details**: 
  - ✅ DATABASE_URL validation in pool.ts
  - ✅ DB_POOL_SIZE with fallback
  - ⚠️ REDIS_URL no graceful degradation
  - ⚠️ Mixed DATABASE_URL vs Supabase config
- **Files**: backend/db/pool.ts, backend/src/config/env.ts
- **Action**: Implement Redis graceful degradation, standardize on DATABASE_URL

### F) pg Pool Hardening ✅
- **Status**: ✅ PASS
- **Details**: 
  - ✅ Throws if DATABASE_URL missing
  - ✅ Safe DB_POOL_SIZE parsing with fallback to 10
  - ✅ SSL with rejectUnauthorized: false
  - ✅ Startup logging
- **File**: backend/db/pool.ts
- **Action**: No changes needed

### G) Redis Client ⚠️
- **Status**: ⚠️ NEEDS IMPROVEMENT
- **Details**: 
  - No graceful degradation if REDIS_URL unset
  - Defaults to localhost (won't work on Replit)
- **Files**: backend/src/config/env.ts:34-36
- **Action**: Implement graceful degradation

### H) CORS ⚠️
- **Status**: ⚠️ NEEDS UPDATE
- **Details**: 
  - Missing Replit domains (*.repl.co, *.replit.dev, *.replit.app)
  - Current: localhost + cabe-arena.com domains
- **File**: backend/src/middleware/security.ts:248-280
- **Action**: Add Replit domains to allowed origins

### I) Build System ⚠️
- **Status**: ⚠️ NEEDS UPDATE
- **Details**: 
  - ✅ tsup builds successfully
  - ⚠️ Missing `pg-native` in externals
  - ⚠️ No Replit-specific build verification
- **File**: backend/tsup.config.ts
- **Action**: Add pg-native to externals

### J) ESM/CJS ⚠️
- **Status**: ⚠️ INCONSISTENT
- **Details**: 
  - Backend: "type": "module" but builds to CJS
  - Frontend: "type": "module"
  - Root: No type specified (CommonJS)
- **Files**: backend/package.json:6, frontend/package.json:5
- **Action**: Verify CJS output works correctly

### K) File System ⚠️
- **Status**: ⚠️ NEEDS CONFIGURATION
- **Details**: 
  - Uses multer for file uploads
  - No temp directory configuration
  - May write to persistent storage
- **Files**: backend/src/middleware/security.ts:290-300
- **Action**: Configure temp directory for ephemeral storage

### L) Background Jobs/Queues ⚠️
- **Status**: ⚠️ NEEDS IMPROVEMENT
- **Details**: 
  - Uses node-cron for scheduled tasks
  - No graceful degradation if Redis unavailable
- **Files**: backend/package.json:58
- **Action**: Implement graceful degradation for background jobs

### M) WebSockets/SSE ⚠️
- **Status**: ⚠️ NEEDS CONFIGURATION
- **Details**: 
  - Uses separate port (WEBSOCKET_PORT: 8080)
  - Not Replit-friendly (single port constraint)
- **Files**: backend/src/config/env.ts:42-43
- **Action**: Configure WebSocket to use same port as HTTP

### N) Security ✅
- **Status**: ✅ PASS
- **Details**: 
  - ✅ No secrets in code
  - ✅ Environment validation with zod
  - ✅ Log redaction implemented
- **Files**: backend/src/config/env.ts, backend/src/middleware/security.ts
- **Action**: No changes needed

### O) Logging ✅
- **Status**: ✅ PASS
- **Details**: 
  - ✅ Clear startup logs
  - ✅ DB pool configuration logged
  - ✅ Port and environment logging
- **Files**: backend/src/index.ts:7-11, backend/db/pool.ts:32-35
- **Action**: No changes needed

### P) Next.js (Frontend) ⚠️
- **Status**: ⚠️ NEEDS DECISION
- **Details**: 
  - Uses Vite, not Next.js
  - Dev server on port 5173
  - Build produces static files
- **Recommendation**: Deploy frontend separately (Vercel/Netlify)
- **Action**: Create backend-only deployment strategy

### Q) Postgres TLS ⚠️
- **Status**: ⚠️ NEEDS IMPROVEMENT
- **Details**: 
  - ✅ SSL enabled with rejectUnauthorized: false
  - ⚠️ No detection of sslmode in DATABASE_URL
  - ⚠️ No FORCE_DB_SSL environment variable
- **File**: backend/db/pool.ts:25-27
- **Action**: Add SSL mode detection and FORCE_DB_SSL support

### R) Bundler Externals ⚠️
- **Status**: ⚠️ NEEDS UPDATE
- **Details**: 
  - ✅ Most dependencies externalized
  - ⚠️ Missing `pg-native` in externals
- **File**: backend/tsup.config.ts:18-50
- **Action**: Add pg-native to externals list

### S) Healthcheck ❌
- **Status**: ❌ MISSING
- **Details**: 
  - No `/health` endpoint
  - Has `/metrics` and `/status` but no simple health check
- **Files**: backend/src/app.ts:50-60
- **Action**: Add `/health` endpoint with DB and Redis checks

### T) CWD and Path Aliases ⚠️
- **Status**: ⚠️ NEEDS VERIFICATION
- **Details**: 
  - Uses TypeScript path mapping
  - Builds to CJS with tsup
  - Need to verify runtime resolution
- **Files**: backend/tsconfig.json
- **Action**: Verify path aliases work in built output

### U) Process Signals ✅
- **Status**: ✅ PASS
- **Details**: 
  - ✅ SIGTERM and SIGINT handled
  - ✅ Graceful shutdown implemented
- **File**: backend/src/index.ts:14-30
- **Action**: No changes needed

### V) Rate Limits/CORS on Replit Domain ⚠️
- **Status**: ⚠️ NEEDS UPDATE
- **Details**: 
  - Rate limiting implemented
  - CORS missing Replit domains
- **Files**: backend/src/middleware/security.ts
- **Action**: Add Replit domains to CORS and rate limiting

### W) Startup Timeouts ⚠️
- **Status**: ⚠️ NEEDS MONITORING
- **Details**: 
  - No explicit startup timeout configuration
  - Database connection may block startup
- **Files**: backend/src/index.ts
- **Action**: Add startup timeout monitoring

## SUMMARY

### ✅ PASS (6 items)
- Node version
- Single exposed server port
- pg Pool hardening
- Security
- Logging
- Process signals

### ⚠️ NEEDS IMPROVEMENT (11 items)
- Start scripts
- Monorepo handling
- Environment handling
- Redis client
- CORS
- Build system
- ESM/CJS
- File system
- Background jobs
- WebSockets
- Postgres TLS
- Bundler externals
- CWD and path aliases
- Rate limits/CORS
- Startup timeouts

### ❌ FAIL (1 item)
- Healthcheck endpoint

## OVERALL VERDICT: ⚠️ SOFT_FAIL

**Primary Issues**:
1. Missing health endpoint
2. CORS not configured for Replit
3. Redis no graceful degradation
4. WebSocket separate port
5. pg-native not externalized

**Recommendation**: Apply patches to achieve PASS status
