# Tasks: Protected Synthetic Score Consultation

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated authored changed lines (source/tests/docs) | ~420–500; task/artifact overhead estimated separately |
| 400-line budget risk | High |
| Chained PRs recommended | No — accepted single-stage size exception |
| Suggested split | One cohesive stage work unit and one parent commit after verification/archive |
| Delivery strategy | exception-ok |
| Chain strategy | none (not applicable; accepted size-exception, no PR chain) |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|---|---|---|---|---|---|
| 1 | Protected score module, ordered authorization, deterministic calculation, HTTP/unit coverage, and concise docs | Single stage commit | `npm test` | Node 24 node:test HTTP servers for two app instances, JWT negative cases, cache headers, and app teardown | Revert `backend/src/score/`, score registration/bootstrap edits, `backend/test/score.test.cjs`, and `README.md` score text |

## Phase 1: RED — Behavioral Contracts and Compilable Stubs

- [x] 1.1 Create `backend/test/score.test.cjs` with failing unit assertions for goldens 12345678-5 → 87, 9876543-3 → 33, lowercase 6-k/6-K → 83, canonical output, fresh ISO clock, and denied calculator/clock spies.
- [x] 1.2 Add failing HTTP assertions for root score routing versus /api/score, absent/invalid JWT (including invalid RUT and unknown claims) returning 401 before disclosure, authenticated invalid RUT 400, ownership 403, administrator 200, exact payload, and no-store on every outcome; add unchanged /login and /api/health regressions.
- [x] 1.3 Add compilable non-registered stubs in `backend/src/score/score.service.ts`, `backend/src/score/score.controller.ts`, and `backend/src/score/score.module.ts`; run RED so behavioral assertions fail without import/compile failures or a provisional public route.

## Phase 2: GREEN — Ordered Core and Wiring

- [x] 2.1 Implement RUT validation/normalization, ownership rules, SHA-256 first-four-byte unsigned big-endian modulo 101 calculator, UTC clock token, exact three-field response, and denial short-circuiting in `backend/src/score/score.service.ts`.
- [x] 2.2 Implement guarded transport and route-scoped no-store middleware in `backend/src/score/score.controller.ts` and `backend/src/score/score.module.ts`; authenticate before validation, authorization, computation, or time generation.
- [x] 2.3 Modify `backend/src/app.module.ts` to pass one dynamic auth module into score registration and `backend/src/bootstrap.ts` to exclude only GET score/:rut from the global api prefix; preserve existing routes.

## Phase 3: REFACTOR — Cross-Boundary Evidence

- [x] 3.1 Extend `backend/test/score.test.cjs` to compare deterministic scores across two app instances and distinct request times, verify fresh UTC timestamps, all no-store denials/success, and literal route compatibility; retain independent goldens and denied spies.
- [x] 3.2 Refactor helpers and interfaces without changing contracts; update `README.md` with concise authenticated score usage and remove the stale no-protected-routes claim.
- [x] 3.3 Run Node 24 root `npm test`, `npm run build -w backend`, and `npm run typecheck -w backend`; record results and confirm no frontend, persistence, dependency, provider, or real-scoring changes.

Threat-matrix documentation-like paths, repository selection, commit/push/PR commands, shell, subprocess, executable-file, and process-integration cases are N/A; route/auth/cache adversarial cases are explicit above.
