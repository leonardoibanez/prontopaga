# Delta for Backend Bootstrap

## MODIFIED Requirements

### Requirement: Shared bootstrap parity

The backend MUST expose one reusable application-construction path that applies the common NestJS configuration, runtime validation, and typed configuration injection. Production startup and HTTP integration tests MUST use that path, including the same required `JWT_SECRET` validation and authentication configuration. The path MUST preserve the existing global `api` prefix, CORS policy, and shutdown-hook behavior.
(Previously: Production and tests shared the prefix, CORS, and lifecycle settings but had no authentication configuration boundary.)

#### Scenario: Production and test share effective authentication configuration

- GIVEN production startup and an HTTP integration test initialize the backend
- WHEN either path creates the application
- THEN both use the same validated configuration boundary and reject missing `JWT_SECRET`
- AND neither path mutates process-wide environment state per test case

#### Scenario: Existing shared settings remain consistent

- GIVEN either production or test initialization succeeds
- WHEN the application is created
- THEN both apply the same `api` prefix, CORS policy, and shutdown-hook configuration
- AND neither path duplicates or bypasses those settings

### Requirement: Health endpoint compatibility

The shared application MUST preserve the existing health contract under the `api` global prefix while adding authentication configuration.
(Previously: The shared application preserved health independently of authentication.)

#### Scenario: Health request succeeds

- GIVEN a server initialized through the shared bootstrap with valid configuration
- WHEN a client sends `GET /api/health`
- THEN the response status is `200`
- AND the JSON body contains `status: "ok"`, `service: "Consulta Riesgo Financiero"`, and an ISO-parseable `timestamp`

#### Scenario: Prefix remains enforced

- GIVEN a server initialized through the shared bootstrap
- WHEN a client requests the health route without the `api` prefix
- THEN the prefixed contract is not replaced by an unprefixed route
