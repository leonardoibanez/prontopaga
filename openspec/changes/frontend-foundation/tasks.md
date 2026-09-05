# Tasks: Frontend Foundation

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 500–700 authored lines across harness, proxy, client, tests, and smoke wiring |
| 400-line budget risk | High |
| Chained PRs recommended | Yes (budget signal; retain one cohesive stage-sized exception) |
| Suggested split | One parent-owned stage commit under accepted size-exception; no artificial slicing |
| Delivery strategy | exception-ok |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: size-exception
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|---|---|---|---|---|---|
| 1 | Complete foundation harness and health proxy | Stage exception | Node 24 root npm test plus lint/typecheck/build | npm run test:e2e with Next/Nest on 3101/3100, cleanup proof | Revert all listed foundation files/scripts |

## Phase 1: Harness and regression boundary

- [x] 1.1 Modify `package.json`, `package-lock.json`, `frontend/package.json` with Vitest/RTL/jsdom/Playwright dependencies and deterministic frontend, root fast-test, and explicit E2E scripts.
- [x] 1.2 Create `frontend/vitest.config.ts`, `frontend/src/test/setup.ts`, `frontend/src/test/server-only.ts`; add a GREEN existing-shell render test in `frontend/src/components/api-status.test.tsx`.
- [x] 1.3 Run harness setup under PATH="/tmp/node-v24.20.0-darwin-arm64/bin:$PATH"; confirm frontend fast tests run without a backend and root npm test executes backend plus frontend.

## Phase 2: Strict TDD health client

- [x] 2.1 Add the first health behavior assertion to `frontend/src/components/api-status.test.tsx`; run the real behavioral RED proving it requests same-origin /api/health before changing client implementation.
- [x] 2.2 Modify `frontend/src/components/api-status.tsx` to use same-origin health, Spanish loading/success/error/retry states, and abort/ignore stale requests; preserve teal CSS and make the RED GREEN.
- [x] 2.3 Add supersession, unmount cancellation, retry, and invalid-payload tests; refactor only after GREEN evidence.

## Phase 3: Server proxy

- [x] 3.1 Create `frontend/src/server/backend-origin.ts` and `frontend/src/server/backend-origin.test.ts`; test missing, relative, unsupported-scheme, credentials/query/hash, and /api-suffixed origins.
- [x] 3.2 Create `frontend/src/app/api/health/route.ts` and `frontend/src/app/api/health/route.test.ts`; add compile seam then RED, then implement fixed upstream path, 8-second abort, redirect error, no-store, validated success, safe 500/502/504 mappings, and non-leaking bodies.
- [x] 3.3 Modify `frontend/.env.example` to document server-only BACKEND_URL without changing real environment files.

## Phase 4: Real smoke and acceptance

- [x] 4.1 Create `frontend/playwright.config.ts`, `frontend/e2e/health.spec.ts`; run actual production Next plus Nest smoke on isolated 127.0.0.1:3101/3100, synthetic secrets, no reuse, bounded SIGTERM/forced cleanup, and port-release evidence.
- [x] 4.2 Run Node 24 root npm test, npm run lint, npm run typecheck, npm run build, backend test/build/typecheck, and explicit E2E; verify Spanish shell, all spec scenarios, rollback file inventory, and no auth/score/backend changes.
