# ERROR ANALYSIS

## Build/Tooling
- npm install failure: "Invalid Version" (local env). Recommendation: Run clean install in CI/Railway; ensure Node LTS (>=18), npm >=9. Delete lockfiles except yarn or choose one manager.

## Backend
- backend/src/config/env.ts
  - PORT default is '5000' transformed to number. OK for Railway (process.env.PORT overrides). Recommendation: keep.
  - JWT_SECRET optional; enforce in production (fail fast if missing).
- backend/src/middleware/security.ts
  - Validation present; Recommendation: add schemas for remaining routes (PUT/PATCH).
- backend/src/lib/ai.ts
  - External API keys optional; Recommendation: return deterministic fallback when absent to preserve UX.
- WebSocket reconnection
  - Client logic: improve exponential backoff and max retries.

## Frontend
- frontend/vite.config.ts
  - Proxy uses process.env.VITE_API_BASE_URL; ensure set in Railway.
- frontend/src/hooks/useAuth.ts
  - Token refresh not implemented; Recommendation: implement refresh or short-lived tokens with silent re-login.
- Data fetching
  - Use of import.meta.env.VITE_API_BASE_URL scattered; Recommendation: centralize API base in one utility.

## Tests
- Vitest/Jest not runnable locally due to toolchain; Recommendation: run in CI. Coverage appears across backend unit/integration and Cypress e2e.
