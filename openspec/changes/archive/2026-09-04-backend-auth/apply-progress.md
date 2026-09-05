# Apply Progress: Backend Authentication

## Status

All 10 planned tasks are complete. The accepted delivery path is `exception-ok` with `size:exception`; no commit, push, PR, frontend change, protected product route, or receipt-driven review was performed.

## Completed Tasks

- [x] 1.1 HTTP RED coverage for the exact login contract and preserved health route.
- [x] 1.2 Bootstrap RED coverage for secret validation and shared application settings.
- [x] 2.1 Bootstrap configuration, validation boundary, JSON limit, and literal login route wiring.
- [x] 2.2 Strict DTO, principal types, and three injected synthetic identities.
- [x] 2.3 Login service/controller/module with server-derived HS256 claims and generic credential denial.
- [x] 3.1 Guard RED coverage for successful principals and token threat cases.
- [x] 4.1 Reusable HS256 guard with token-time, claim, RUT, and catalog binding validation.
- [x] 4.2 Application-resolved guard integration tests without per-test environment mutation.
- [x] 5.1 Pinned backend dependencies, blank secret template, and Spanish synthetic-demo guidance.
- [x] 5.2 Backend-only test, build, typecheck, and compiled child-process startup evidence.

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 1.1 | `backend/test/auth.test.cjs` | HTTP integration | Existing 13 tests passed while 6 new assertions failed | `npm test`: `/login` returned `404` instead of `200`/`400`/`401` | `npm test`: login assertions passed | Valid admin plus three catalog identities; malformed, non-object, extra, oversized, unknown-user, wrong-password, and route cases | Shared login/start helpers extracted |
| 1.2 / 2.1 | `backend/test/health.test.cjs` | Bootstrap integration | Existing health/RUT coverage retained | `npm test`: missing `jwtSecret` and missing-secret rejection assertions failed | `npm test`: bootstrap assertions passed | Missing, empty, whitespace-only, explicit, and default configuration cases | Secret validation centralized in `requireJwtSecret` |
| 2.2 / 2.3 | `backend/test/auth.test.cjs` | HTTP integration | Covered by the Phase 1 suite | Login initially returned `201` rather than specified `200` | `npm test`: exact bearer contract passed | Admin and both users prove catalog-derived roles/RUTs and 900-second lifetime | Typed identity and response contracts isolated from transport |
| 3.1 / 4.1 | `backend/test/auth.test.cjs` | Guard integration | Existing login/health/RUT suite remained green | `npm test`: valid guard-principal test failed with `401` from the signature stub | `npm test`: valid principals and all denial cases passed | Absent, malformed, tampered, expired, HS384, `none`, invalid time, unknown subject, role drift, and RUT drift | Guard reconstructs immutable principals rather than trusting token payloads |
| 4.2 / 5.2 | `backend/test/auth.test.cjs`, `backend/test/health.test.cjs` | HTTP/runtime integration | Full backend suite | `npm test`: `createApplication` accepted whitespace-only secret | `npm test`: 24/24 passed | Parser/configuration assertions plus direct child `dist/main.js` no-secret startup probe | Shared bootstrap remains the sole runtime/test construction path |

## Work Unit Evidence

| Work unit | Focused test command and result | Runtime harness and result | Rollback boundary |
|---|---|---|---|
| Config and strict input boundary | `PATH=/tmp/node-v24.20.0-darwin-arm64/bin:$PATH npm test` — exit 0, 24/24 | HTTP requests through `createApplication`; strict `/login`, `/api/health`, CORS, and 16 KiB body boundary passed | `backend/src/bootstrap.ts`, `backend/src/app.module.ts`, `backend/test/health.test.cjs`, login DTO tests |
| Synthetic issuance and claims | `PATH=/tmp/node-v24.20.0-darwin-arm64/bin:$PATH npm test` — exit 0, 24/24 | HTTP login for administrator and both users passed; claims are HS256 and `exp - iat = 900` | `backend/src/auth/{login.dto,auth.types,synthetic-identities,auth.service,auth.controller,auth.module}.ts` and `backend/test/auth.test.cjs` |
| Guard, docs, and dependency wiring | `npm test`, `npm run build -w backend`, and `npm run typecheck -w backend` under Node 24 — all exit 0 | Persistent `node dist/main.js` no-secret probe exits 1 within 5 seconds; test captures the exact child PID and kills only that PID on timeout | `backend/src/auth/auth.guard.ts`, tests, backend dependency files, `README.md`, and `backend/.env.example` |

## Verification Evidence

- `PATH=/tmp/node-v24.20.0-darwin-arm64/bin:$PATH npm test` — exit 0; 24 tests passed, 0 failed.
- `PATH=/tmp/node-v24.20.0-darwin-arm64/bin:$PATH npm run build -w backend` — exit 0.
- `PATH=/tmp/node-v24.20.0-darwin-arm64/bin:$PATH npm run typecheck -w backend` — exit 0.
- `git diff --check` — exit 0.

## Corrective Remediation Evidence

The independent verification report at
`sha256:1bfb600d8f6465d2d7deae4a4d0c71fc98f17f1e0126f33d0d934e080d235493`
found that `AuthGuard` accepted a signed dotted RUT claim by normalizing it
before comparing it with the catalog identity. This bounded remediation keeps
all 10 planned tasks complete and adds regression evidence without replacing
the failing verification report.

| Work unit | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| Verify-auth-contract: normalized user RUT claims | `backend/test/auth.test.cjs` | Nest integration | `PATH=/tmp/node-v24.20.0-darwin-arm64/bin:$PATH npm test` — exit 0; 24/24 passed before changes | Added the signed dotted RUT claim assertion first; `npm test` exited 1 with `Missing expected exception` because the guard accepted `12.345.678-5` | Replaced normalize-before-compare with exact canonical catalog equality; `npm test` exited 0; 25/25 passed | The same application-resolved guard accepts compact `12345678-5` and rejects dotted `12.345.678-5`, although both normalize to the catalog identity | Removed the now-unneeded `normalizeRut` import; no further refactor needed |

### Corrective Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused test command and exact result | `PATH=/tmp/node-v24.20.0-darwin-arm64/bin:$PATH npm test` — exit 0; 25 passed, 0 failed, 0 skipped. |
| Runtime harness command/scenario and exact result | The same command builds the backend and executes the application-resolved `AuthGuard` with real `JwtService` signatures: compact catalog RUT claim accepted; dotted claim rejected with `401`; exit 0. |
| Rollback boundary | `backend/src/auth/auth.guard.ts`, `backend/test/auth.test.cjs`, and the stale scope sentence in `README.md`; reverting these restores the previous behavior without touching the other 10 completed tasks. |

## Scope and Deviations

None — implementation matches the approved design. The body-limit implementation uses Nest's `useBodyParser('json', { limit: '16kb' })` after disabling the default parser, which preserves the design's 16 KiB constraint without adding an Express typing dependency.

## Files Changed

- `backend/src/auth/` — dynamic auth module, DTO, identity catalog, login service/controller, typed principal, and reusable guard.
- `backend/src/{app.module,bootstrap}.ts` — validated injected configuration, shared bootstrap behavior, and strict input boundary.
- `backend/test/{auth,health}.test.cjs` — HTTP, guard, bootstrap, and real child-process startup coverage.
- `backend/package.json`, `package-lock.json` — exact planned dependencies.
- `backend/.env.example`, `README.md` — blank secret template and synthetic-demo documentation.

## Review Workload

- Strategy: `exception-ok` / `size:exception`.
- Authored application/test/docs changes exceed the 400-line target as forecast; generated lockfile churn is reported separately.
- No commit was created; the parent orchestrator owns the authorized post-archive conventional commit.
