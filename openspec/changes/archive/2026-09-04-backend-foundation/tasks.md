# Tasks: Shared Backend Bootstrap

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines (total) | ~180 (implementation ~75; tests ~105) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single cohesive work unit |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Shared parser/factory, production wiring, and HTTP regressions | Single PR if requested | `PATH="/tmp/node-v24.20.0-darwin-arm64/bin:$PATH" npm test` | Real node:test HTTP server on 127.0.0.1:0, CORS preflight, and app.close() | Revert `backend/src/bootstrap.ts`, `backend/src/main.ts`, and `backend/test/health.test.cjs`; restore prior bootstrap behavior |

## Phase 1: RED — Regression Contracts

- [x] 1.1 Extend `backend/test/health.test.cjs` with failing `parseBootstrapConfig` cases for explicit values, both defaults, non-integer ports, and ports outside 1..65535; assert the exact existing error text.
- [x] 1.2 Replace direct NestFactory setup in `backend/test/health.test.cjs` with the planned shared factory and add failing HTTP assertions for `/api/health`, unprefixed `/health`, configured/default CORS, and deterministic teardown.

## Phase 2: GREEN — Shared Implementation

- [x] 2.1 Create `backend/src/bootstrap.ts` with read-only environment/config contracts, exact port validation, and `createApplication` applying the `api` prefix, CORS origin, shutdown hooks, and optional quiet logger.
- [x] 2.2 Modify `backend/src/main.ts` to parse `process.env`, call the shared factory, retain dotenv/metadata loading, production port listening, logging, and existing catch/error behavior.

## Phase 3: REFACTOR — Integration Evidence

- [x] 3.1 Refactor `backend/test/health.test.cjs` helpers so each case uses isolated environment objects, listens only on loopback port 0, and closes the Nest app via registered teardown without duplicated bootstrap configuration.
- [x] 3.2 Run `PATH="/tmp/node-v24.20.0-darwin-arm64/bin:$PATH" npm run typecheck -w backend` and root `npm test`; record backend build, node:test, health/CORS/prefix, and lifecycle evidence without touching frontend files.

Threat-matrix cases are N/A per design; no additional security or process-boundary tasks apply.
