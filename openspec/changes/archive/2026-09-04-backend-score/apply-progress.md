# Apply Progress: backend-score

## Status
All 9 assigned tasks are complete. Strict TDD was followed with a behavioral RED run before GREEN implementation.

## Completed Tasks
- [x] 1.1 Unit RED coverage for deterministic goldens, canonicalization, timestamp, and denial spies.
- [x] 1.2 HTTP RED coverage for rooted routing, auth-first denials, ownership, admin access, payload shape, no-store, and compatibility.
- [x] 1.3 Compilable, unregistered score stubs followed by a behavioral RED run.
- [x] 2.1 Ordered RUT validation/normalization, authorization, SHA-256 calculator, clock injection, and exact response projection.
- [x] 2.2 AuthGuard-protected controller and pre-guard route middleware for `Cache-Control: no-store`.
- [x] 2.3 One dynamic AuthModule registration reused by ScoreModule; only `GET score/:rut` excluded from `/api`.
- [x] 3.1 Two-instance HTTP and distinct-time coverage with teardown, all denial cache headers, and literal route compatibility.
- [x] 3.2 README usage update and stale protected-route statement removal.
- [x] 3.3 Node 24 root tests, backend build, and backend typecheck executed successfully.

## TDD Cycle Evidence

| Tasks | Layer | Safety net | RED | GREEN | Triangulate | Refactor |
|---|---|---|---|---|---|---|
| 1.1–1.3 | Unit + HTTP integration | `PATH="/tmp/node-v24.20.0-darwin-arm64/bin:$PATH" npm test` → exit 0, 25/25 before changes | Same root command → exit 1, 25 pass / 4 behavioral failures; source stubs compiled | Root command → exit 0, 30/30 | Goldens for 12345678-5=87, 9876543-3=33, 6-K=83; dot, compact, and K variants; 401/400/403/200 cases | Extracted calculator and clock seams; no behavior change |
| 2.1–2.3 | Unit + HTTP integration | Existing baseline above | Tests written before production implementation | Root command → exit 0, 30/30 | Two app instances, multiple identities, distinct timestamps, valid/invalid JWT claims | Narrow DI tokens and route middleware retained |
| 3.1–3.3 | HTTP integration + docs | Root command after implementation → exit 0, 30/30 | Cross-boundary cases were present before final wiring | Root command → exit 0, 30/30 | Every score outcome asserts no-store and compatibility endpoints stay reachable | README reduced to concise usage |

## Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused test command | `PATH="/tmp/node-v24.20.0-darwin-arm64/bin:$PATH" npm test` → exit 0; node:test: 30 passed, 0 failed |
| Runtime harness | Same Node 24 command starts two real Nest/HTTP applications, uses login-issued and forged JWTs, exercises 401/400/403/200, and closes each app via test teardown → exit 0 |
| Backend build | `PATH="/tmp/node-v24.20.0-darwin-arm64/bin:$PATH" npm run build -w backend` → exit 0 |
| Backend typecheck | `PATH="/tmp/node-v24.20.0-darwin-arm64/bin:$PATH" npm run typecheck -w backend` → exit 0 |
| Rollback boundary | Revert `backend/src/score/`, `backend/src/app.module.ts`, `backend/src/bootstrap.ts`, `backend/test/score.test.cjs`, and the README score section. No frontend, persistence, dependency, external provider, or real-scoring change. |

## Delivery

- Strategy: `exception-ok`; accepted size exception, chain: none.
- Commit/review/attempt settlement are owned by the parent. No commit, acquire/settle, or review command was run by this executor.

## Files Changed

- `backend/src/score/score.service.ts`
- `backend/src/score/score.controller.ts`
- `backend/src/score/score.module.ts`
- `backend/src/app.module.ts`
- `backend/src/bootstrap.ts`
- `backend/test/score.test.cjs`
- `README.md`
- `openspec/changes/backend-score/tasks.md`
