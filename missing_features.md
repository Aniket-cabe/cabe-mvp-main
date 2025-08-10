# CaBE Arena — Missing Features & Gaps

Severity scale: P0 (blocking), P1 (high), P2 (medium), P3 (low)

## Backend

- [P0] Full SSO readiness (SAML/OAuth wiring): passport serialize/deserialize, Azure strategy, sso.json loading, token/session handling.
- [P0] RBAC enforcement on admin/enterprise endpoints across routers using `rbacMiddleware`.
- [P1] GDPR endpoints: export/delete user; immutable audit logs migration; field-level encryption usage at write/read boundaries.
- [P1] Request signing for integrations; per-integration rate limits.
- [P1] WebSocket broadcast for leaderboard/task updates; scale tests (100 connections).
- [P2] Queue service (BullMQ/Redis) abstraction for async jobs.
- [P2] DB migrations for proofs table and audit immutability; seed and RLS review.

## Frontend

- [P0] Strict TS config across frontend; eliminate any implicit anys/dead code.
- [P1] Pages: /tasks, /leaderboard, /profile responsive + accessible; consolidate state management.
- [P1] Real-time notification UI wiring to WS events.
- [P2] Bundle analysis + lazy loading heavy charts/routes; image optimization.
- [P2] Voice review sweep with before/after updates.

## Testing & Tooling

- [P0] CI pipeline to run unit/integration/E2E and security scans.
- [P1] Load/stress tests (1k concurrent, 500ms latency simulation).
- [P1] Regression suites for auth, scoring, leaderboard.

## Completion plan (high-level)

1. Finish SSO + RBAC enforcement and GDPR endpoints; add proofs migration (P0/P1)
2. Wire WS server broadcasts + client handlers; add integration rate limiting/signing (P1)
3. Strict TS front/back; refactors; responsive/accessibility passes; bundle optimizations (P1/P2)
4. Add BullMQ adapter + K8s manifests; caching (P2)
5. Tests/CI/Scans; voice sweep; finalize docs and logs (P0/P1)
