# Tasks: Backend Authentication

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated authored changed lines | 650–800 (source, tests, docs); generated `package-lock.json` churn estimated separately at 100–200 lines |
| 400-line budget risk | High |
| Chained PRs recommended | Yes (logical slices; one cohesive stage commit is retained by exception) |
| Suggested split | Foundation/input → issuance → guard/integration/docs |
| Delivery strategy | exception-ok |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: size-exception
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|---|---|---|---|---|---|
| 1 | Config and strict input boundary | Stage 3 slice | `npm test` | Node 24 HTTP tests through shared bootstrap | `backend/src/bootstrap.ts`, `backend/src/app.module.ts`, DTO and boundary tests |
| 2 | Synthetic identities, issuance, and claims | Stage 3 slice | `npm test` | Node 24 valid/invalid login scenarios | `backend/src/auth/login.dto.ts`, `backend/src/auth/auth.types.ts`, `backend/src/auth/synthetic-identities.ts`, `backend/src/auth/auth.service.ts`, `backend/src/auth/auth.controller.ts`, `backend/src/auth/auth.module.ts` |
| 3 | Guard, docs, and dependency wiring | Stage 3 slice | `npm test` plus backend build/typecheck | Node 24 bearer scenarios and missing-secret startup | `backend/src/auth/auth.guard.ts`, `backend/test/auth.test.cjs`, `backend/test/health.test.cjs`, `backend/package.json`, `package-lock.json`, `backend/.env.example`, `README.md` |

## Phase 1: RED — Contracts and Bootstrap Boundary

- [x] 1.1 Add failing HTTP assertions in `backend/test/auth.test.cjs` for exact credentials-only payloads, malformed/extra/oversized bodies, uniform invalid-credential `401`, literal POST /login routing, rejection of /api/login as the login contract, and preservation of /api/health.
- [x] 1.2 Add failing bootstrap assertions in `backend/test/health.test.cjs` for absent/empty `JWT_SECRET`, shared configuration parity, global `api` prefix, CORS, shutdown hooks, and health response shape.

## Phase 2: GREEN — Configuration, DTO, Identities, and Issuance

- [x] 2.1 Implement `backend/src/bootstrap.ts` parsing required nonblank `JWT_SECRET`, strict validation/body limits, and method-scoped login exclusion; wire `backend/src/app.module.ts` through dynamic configuration.
- [x] 2.2 Create `backend/src/auth/login.dto.ts`, `backend/src/auth/auth.types.ts`, and `backend/src/auth/synthetic-identities.ts` for strict DTOs, typed principals, and exactly three server-owned demo identities.
- [x] 2.3 Create `backend/src/auth/auth.service.ts`, `backend/src/auth/auth.controller.ts`, and `backend/src/auth/auth.module.ts` for credential lookup, generic failures, and HS256 900-second issuance with server-derived claims.

## Phase 3: RED — Verification Threat Cases

- [x] 3.1 Extend `backend/test/auth.test.cjs` with failing guard assertions for absent, malformed, tampered, expired, wrong-algorithm, invalid-time, unknown-sub, role/RUT-drift tokens, plus valid admin/user principals and exact claim lifetime.

## Phase 4: GREEN/REFACTOR — Reusable Guard and Integration

- [x] 4.1 Create `backend/src/auth/auth.guard.ts` to allow-list HS256, validate claims/times/catalog binding, reconstruct principals, and uniformly deny invalid bearer tokens.
- [x] 4.2 Update `backend/test/health.test.cjs` and `backend/test/auth.test.cjs` to resolve the guard via the application without per-test environment mutation; refactor only after RED/GREEN evidence.

## Phase 5: Dependencies and Documentation

- [x] 5.1 Update `backend/package.json`, `package-lock.json`, `backend/.env.example`, and `README.md` with pinned dependencies, blank secret guidance, generation command, and synthetic-only credential limits.
- [x] 5.2 Record apply evidence using Node 24 `npm test`, `npm run build -w backend`, and `npm run typecheck -w backend`; final verification must include actual runtime evidence, not static assumptions. No score route or frontend work.
