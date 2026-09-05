# Backend Bootstrap Specification

## Purpose

Define the shared NestJS application bootstrap used by production startup and HTTP integration tests. Stage 1 preserves current health, configuration, and lifecycle behavior; authentication, RUT/score features, persistence, frontend changes, and new dependencies are excluded.

## Requirements

### Requirement: Shared bootstrap parity

The backend MUST expose one reusable application-construction path that applies the common NestJS configuration, and both production startup and HTTP integration tests MUST use that path.

#### Scenario: Production and test share configuration

- GIVEN the production entry point and the HTTP integration test create an application
- WHEN either path initializes the NestJS application
- THEN both apply the same global prefix, CORS policy, and shutdown-hook configuration
- AND neither path duplicates or bypasses those shared settings

### Requirement: Health endpoint compatibility

The shared application MUST preserve the existing health contract under the `api` global prefix.

#### Scenario: Health request succeeds

- GIVEN a server initialized through the shared bootstrap
- WHEN a client sends `GET /api/health`
- THEN the response status is `200`
- AND the JSON body contains `status: "ok"`, `service: "Consulta Riesgo Financiero"`, and an ISO-parseable `timestamp`

#### Scenario: Prefix remains enforced

- GIVEN a server initialized through the shared bootstrap
- WHEN a client requests the health route without the `api` prefix
- THEN the prefixed contract is not replaced by an unprefixed route

### Requirement: Environment and CORS defaults

The bootstrap MUST preserve the current environment behavior: CORS allows the configured `FRONTEND_URL` origin, defaults to `http://localhost:3000` when unset, and production listening defaults to port `3001` when `PORT` is unset. Invalid `PORT` values MUST fail startup rather than silently coercing them.

#### Scenario: Configured and default values apply

- GIVEN `FRONTEND_URL` and `PORT` are set to valid values
- WHEN production startup initializes
- THEN CORS uses the configured origin and listening uses the configured port
- WHEN either variable is unset
- THEN the documented defaults are used

#### Scenario: Invalid port is rejected

- GIVEN `PORT` is non-integer, below `1`, or above `65535`
- WHEN production startup validates configuration
- THEN startup fails with the existing invalid-port error behavior

### Requirement: Deterministic lifecycle and teardown

The bootstrap MUST enable Nest shutdown hooks. Integration tests MUST be able to bind an ephemeral loopback port after shared initialization and MUST close the application during teardown.

#### Scenario: Test server releases resources

- GIVEN an integration test initializes the shared application and listens on an ephemeral loopback port
- WHEN the test completes
- THEN teardown closes the Nest application and its underlying HTTP server deterministically
- AND no persistent listener is required for the test process
