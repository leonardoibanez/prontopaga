# Apply Progress: Frontend Foundation

**Status:** Implementation complete — 11/11 tasks complete; independent SDD verification pending
**Mode:** Strict TDD
**Delivery:** `exception-ok` / `size:exception`; one parent-owned foundation work unit, no chain.

## Completed Tasks

- [x] 1.1 Install and wire Vitest, React Testing Library, jsdom, Playwright, fast tests, and explicit E2E scripts.
- [x] 1.2 Add the frontend test configuration, setup, `server-only` test seam, and existing Spanish shell render test.
- [x] 1.3 Prove the frontend harness and root fast regression run without a live backend listener.
- [x] 2.1 Record a behavioral RED for the direct public backend URL instead of same-origin `/api/health`.
- [x] 2.2 Move the client to same-origin health with Spanish status and cancellation behavior.
- [x] 2.3 Add invalid-payload, retry supersession, and unmount cancellation coverage.
- [x] 3.1 Add server-only validated backend-origin parsing and adversarial configuration coverage.
- [x] 3.2 Add the bounded Node health route with fixed forwarding, no-store responses, and safe mappings.
- [x] 3.3 Replace the public example variable with server-only `BACKEND_URL`.
- [x] 4.1 Add an owned Playwright production smoke on fixed loopback ports.
- [x] 4.2 Record apply-phase execution evidence for the required Node 24 command set; independent verification remains pending.

## TDD Cycle Evidence

| Task | Test File / Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|
| 1.1 | Structural package wiring | N/A (new wiring) | N/A — one-output configuration | `npm test` exit 0 | Skipped: structural | No behavior refactor needed |
| 1.2 | `api-status.test.tsx` / RTL | N/A (new test) | N/A — specified existing-shell GREEN | Focused test exit 0 | Existing shell plus successful state | Setup kept minimal |
| 1.3 | Vitest/root regression | N/A (harness activation) | N/A — harness bootstrap | `npm test` exit 0 | Backend and frontend suites | None needed |
| 2.1–2.2 | `api-status.test.tsx` / RTL | 1 existing test passing | Exit 1: expected `/api/health`, received `http://localhost:3001/api/health` | Focused test exit 0 after client change | Same-origin request plus connected shell | Extracted `isHealthyResponse` only after payload RED |
| 2.3 | `api-status.test.tsx` / RTL | 2 focused tests passing | Exit 1: incomplete `{ status: 'ok' }` rendered connected | Focused suite exit 0 | Invalid payload, supersession, unmount cancellation | Predicate extraction retained; no CSS change |
| 3.1 | `backend-origin.test.ts` / Node unit | N/A (new module) | Exit 1: validation seam threw unimplemented error | 11 tests exit 0 | Valid roots and 10 unsafe configurations | Shared bounded error message |
| 3.2 | `route.test.ts` / Node route | 11 origin tests passing | Exit 1: compile seam returned 501 instead of 200/500/502/504 | 6 tests exit 0 | Success, config, non-success, malformed JSON/payload, timeout | Safe response helper and payload guard |
| 3.3 | Environment example | N/A (documentation-like config) | N/A — one-output example | `npm run typecheck` exit 0 | Skipped: structural | No real `.env` touched |
| 4.1 | `e2e/health.spec.ts` / Playwright | Fast suite passing | N/A — harness configuration | 1 Chromium test exit 0 | Spanish shell plus proxied connected status | First E2E launch exposed workspace cwd; config now explicitly changes to root before workspace commands |
| 4.2 | Apply-phase command evidence | All fast tests passing | N/A — verification task | Recorded commands exited 0; independent verification pending | Backend and frontend quality/runtime paths | No changes after final apply commands except this evidence artifact |

## Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused fast tests | `npm run test -w frontend` — exit 0; 3 files, 22 tests passed. |
| Runtime harness | `npm run test:e2e` — exit 0; Chromium production smoke passed on owned `127.0.0.1:3101` Nest and `127.0.0.1:3100` Next servers. Both ports had no listener after teardown. |
| Rollback boundary | Revert the frontend harness, health proxy/client, `.env.example`, root scripts, and lockfile together. No backend source/API contract changed. |

## Apply-Phase Execution Evidence

This section records the executor's actual command outcomes. It is not an
independent SDD verify report and does not claim final verification.

- `node --version` → `v24.20.0`
- `npm test` → exit 0; backend 30 passed, frontend 22 passed.
- `npm run lint` → exit 0.
- `npm run typecheck` → exit 0.
- `npm run build` → exit 0; Next emitted dynamic `/api/health` route.
- `npm run test:e2e` → exit 0; 1 Chromium test passed.
- `npm run test -w backend` → exit 0; 30 backend tests passed.
- `npm run build -w backend` → exit 0.
- `npm run typecheck -w backend` → exit 0.
- `npm run test:e2e` initially exited 1 because Playwright runs its web-server commands from `frontend/`, where `npm -w backend` cannot resolve the root workspace. The command now uses `cd ..` before each workspace command; rerun passed.

## Scope and Security Notes

- `BACKEND_URL` is server-only, validated as an absolute root HTTP(S) origin, and never echoed or logged.
- The proxy forwards only `${origin}/api/health` with `cache: 'no-store'`, `redirect: 'error'`, and an eight-second abort; all responses are no-store.
- Safe errors are exactly `HEALTH_CONFIG_ERROR` (500), `HEALTH_UPSTREAM_ERROR` (502), and `HEALTH_UPSTREAM_TIMEOUT` (504).
- No auth, score, session, backend source, real environment file, commit, PR, or receipt-driven review was added.
