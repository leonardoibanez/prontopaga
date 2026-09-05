# Proposal: Frontend Foundation

## Intent

Establish a verifiable frontend foundation before authentication or score workflows. The Next.js app has no test runner, root `npm test` covers only the backend, and browser health checks use public backend configuration.

## Scope

### In Scope
- Verify Node.js 24.
- Add Vitest, React Testing Library, jsdom, and a separate Playwright harness.
- Expand root `npm test` to backend and frontend unit/component/route tests; keep E2E explicit.
- Preserve the Spanish light-teal plain-CSS shell.
- Add same-origin `GET /api/health`, forwarding to fixed backend `/api/health` with server-only `BACKEND_URL`, `no-store`, an 8-second timeout, and safe errors.

### Out of Scope
- Login, cookies, sessions, logout, RUT, score, or role-based UI.
- Backend contracts, framework upgrades, state/UI libraries, real `.env` edits, commits, push/PR, or receipt-driven review.

## Capabilities

### New Capabilities
- `frontend-test-foundation`: Frontend tests, separate browser E2E scaffolding, and workspace regression execution.
- `frontend-health-proxy`: Same-origin, non-cacheable health status through a bounded server request.

### Modified Capabilities
- None.

## Approach

Configure the harness first. Then use strict RED-GREEN-REFACTOR for health behavior. A Next.js App Router GET route reads server-only `BACKEND_URL` as an origin without `/api`, requests fixed `/api/health` with `cache: "no-store"` and an 8-second abort timeout, and returns bounded errors without leaking configuration. The existing client uses the same-origin route and Spanish status copy.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `frontend/package.json`, test config | Modified/New | Test commands and harnesses |
| `frontend/src/app/api/health/route.ts` | New | Server-only health proxy |
| `frontend/src/components/api-status.tsx` | Modified | Same-origin health client |
| root `package.json` | Modified | Backend plus frontend fast tests |
| environment examples | Modified | Server-only backend origin |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Proxy hangs or exposes details | Medium | Timeout, no-store, bounded errors |
| Root tests omit workspaces or slow down | Medium | Prove both suites; separate Playwright |
| Runtime evidence is invalid | Low | Verify Node 24 process-locally |

## Rollback Plan

Revert foundation files and scripts together; restore direct health access and backend-only root tests. No backend or data migration is involved.

## Dependencies

- Node.js `>=24 <25`
- Existing backend `GET /api/health`
- Vitest, React Testing Library, jsdom, Playwright

## Success Criteria

- [ ] Node 24, frontend tests, backend regressions, lint, typecheck, and build pass.
- [ ] Root `npm test` runs both fast suites; Playwright remains separate.
- [ ] Health success, timeout, upstream failure, and safe errors have automated evidence.
- [ ] No deferred product behavior or backend contract change is introduced.
