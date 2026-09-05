# Proposal: Establish a Shared Backend Bootstrap

## Intent

Centralize NestJS application configuration so production startup and HTTP integration tests exercise the same bootstrap rules. The current test constructs the server separately from `main.ts`, leaving prefix, CORS, environment defaults, and shutdown behavior unproven.

## Scope

### In Scope

- Extract reusable application creation/configuration from the production entry point.
- Update backend HTTP tests to use the shared bootstrap while retaining `node:test`.
- Preserve `GET /api/health`, the `api` prefix, CORS, default environment/port behavior, and shutdown hooks.
- Verify backend build, type checks, and tests with the approved local Node 24 runtime.

### Out of Scope

- Login, JWT, RUT validation, score calculation, persistence, or new dependencies.
- Frontend changes, global Node installation, delivery operations, or review-mode activation.

## Capabilities

### New Capabilities

- `backend-bootstrap`: Shared NestJS application construction and configuration for production startup and HTTP testing.

### Modified Capabilities

None.

## Approach

Introduce a focused bootstrap function that creates and configures the existing NestJS Express application. Keep process-specific listening in the production entry point, and have HTTP tests call the shared function before listening on an ephemeral loopback port. Add failing bootstrap-focused assertions first, then implement and refactor under strict RED–GREEN–REFACTOR.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/src/main.ts` | Modified | Delegate shared setup while preserving production startup behavior. |
| `backend/src/` | New | Add the reusable application bootstrap module. |
| `backend/test/health.test.cjs` | Modified | Start the test server through the production-equivalent bootstrap. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Refactor changes observable startup behavior | Low | Lock existing prefix, CORS, defaults, health response, and shutdown setup with HTTP-focused tests. |
| Test server leaks resources | Low | Retain ephemeral binding and deterministic teardown. |

## Rollback Plan

Revert the bootstrap extraction and restore the prior `main.ts` and health-test setup; no data migration or dependency rollback is required.

## Dependencies

- Existing NestJS, Express adapter, TypeScript, and `node:test` dependencies only.
- Local Node 24 runtime at `/tmp/node-v24.20.0-darwin-arm64/bin`.

## Success Criteria

- [ ] Production and HTTP tests use the same application bootstrap configuration.
- [ ] `GET /api/health` remains available with unchanged behavior.
- [ ] Backend build, type checks, and tests pass on Node 24.
- [ ] Frontend and deferred backend features remain unchanged.
