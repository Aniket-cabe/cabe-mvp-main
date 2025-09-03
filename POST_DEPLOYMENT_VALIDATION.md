# POST DEPLOYMENT VALIDATION

## Smoke Tests
- GET /api/health → 200
- GET / → service banner
- WebSocket: connect, send/receive message

## Auth Flow
- Register user → 201
- Login → token issued
- Access /api/me with token → 200
- Logout → token invalidated

## Files
- Upload sample PNG (<=2MB) → 200
- Retrieve URL → 200
- Delete → 200

## Scoring
- POST /api/score with sample payload → schema match
- Edge: zero/negative/large inputs handled

## CaBOT
- POST /api/ai/ask with small prompt
- If no keys set → friendly error JSON

## Observability
- Check logs for errors
- Verify response times < 500ms p95 on light load

## Rollback Plan
- Keep previous successful deployment active
- Use Railway rollback if regression observed
