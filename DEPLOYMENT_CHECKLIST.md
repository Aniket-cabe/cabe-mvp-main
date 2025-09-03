# DEPLOYMENT CHECKLIST (Railway)

## Services
- [ ] PostgreSQL provisioned and `DATABASE_URL` set
- [ ] Web service created from repo

## Environment Variables
- [ ] PORT (auto on Railway)
- [ ] JWT_SECRET (32+ chars)
- [ ] FRONTEND_URL (e.g., https://<frontend>.railway.app)
- [ ] VITE_API_BASE_URL (backend public URL)
- [ ] SUPABASE_URL
- [ ] SUPABASE_ANON_KEY
- [ ] Optional: OPENAI_API_KEY or OPENROUTER_API_KEY

## Backend
- [ ] Procfile present
- [ ] package.json scripts include "railway-build"
- [ ] CORS configured with FRONTEND_URL and credentials
- [ ] Start command binds `process.env.PORT`
- [ ] Run DB migrations if applicable

## Frontend
- [ ] Build succeeds (`npm run build`)
- [ ] VITE_API_BASE_URL set at build time
- [ ] Output directory `dist`

## Validation
- [ ] Health endpoint 200
- [ ] Auth: register → login → protected route 200
- [ ] WebSocket connects and broadcasts
- [ ] File upload works within limits
- [ ] Scoring endpoint returns expected schema
- [ ] CaBOT responds or fails gracefully without keys

## Post-Deploy
- [ ] Enable logs & alerts on Railway
- [ ] Verify CORS from production domain
- [ ] Cache and gzip enabled
