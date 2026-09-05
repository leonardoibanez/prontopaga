# Backend Score Specification

## Purpose

Define protected, deterministic synthetic score consultation for a valid Chilean RUT.

## Requirements

### Requirement: Protected root score route and compatibility

The backend MUST expose protected `GET /score/:rut` at the HTTP root
from its first version. It MUST NOT expose `/api/score`; existing `POST /login`
and `GET /api/health` contracts MUST remain unchanged.

#### Scenario: [HTTP] Existing routes remain compatible

- GIVEN a configured backend
- WHEN a client calls `/login` or `/api/health`
- THEN each route behaves as previously specified

#### Scenario: [HTTP] Score route is rooted and protected

- GIVEN a client calls `/score/:rut` without valid authentication
- WHEN the request is evaluated
- THEN it receives `401`, and `/api/score/:rut` is not the score route

### Requirement: Authenticate, validate, and authorize in order

The score route MUST authenticate before RUT validation, ownership checks, score
calculation, or consultation-time generation. Any invalid authentication MUST
return `401`, even for an invalid RUT. After valid authentication, an invalid
RUT MUST return `400`. A user MUST be restricted to their own normalized RUT
(`403` for another); an administrator MAY consult any valid RUT.

#### Scenario: [HTTP] Authentication failure precedes RUT disclosure

- GIVEN an absent or invalid token with an invalid RUT
- WHEN the client requests the score
- THEN the response is `401`, not `400`, `403`, or `200`

#### Scenario: [HTTP] Authenticated invalid RUT is rejected

- GIVEN a valid bearer principal and syntactically or checksum-invalid RUT
- WHEN the client requests the score
- THEN the response is `400`

#### Scenario: [HTTP] Ownership is enforced

- GIVEN a valid user principal and a valid RUT
- WHEN the RUT is not that principal's normalized RUT
- THEN the response is `403`; the principal's own RUT is permitted

#### Scenario: [HTTP] Administrator access is broad

- GIVEN a valid administrator principal and any valid RUT
- WHEN the client requests the score
- THEN the response is `200`

#### Scenario: [Unit] Denials do not compute protected outputs

- GIVEN authentication, validation, or ownership denies a request
- WHEN the route pipeline handles it
- THEN score computation and `fecha` generation are not invoked

### Requirement: Return deterministic synthetic consultation data

For an authorized valid RUT, the backend MUST return HTTP `200` with exactly
`rut`, `score`, and `fecha`. `rut` MUST be canonical dotted form with uppercase
`K`; `score` MUST be an integer `0..100`; and `fecha` MUST be a UTC ISO
timestamp generated at consultation time. Scores MUST be deterministic across
calls, instances, time, and input formats: hash the UTF-8 normalized undotted
RUT with its hyphen retained using SHA-256, interpret the first four digest
bytes as unsigned big-endian, and take modulo `101`. Hash collisions are allowed.

#### Scenario: [Unit] Equivalent inputs produce one stable score

- GIVEN equivalent accepted RUT formats, including lowercase `k`
- WHEN each is scored repeatedly
- THEN the score and canonical output are identical, while `fecha` is fresh UTC ISO data

#### Scenario: [HTTP] Success payload is exact

- GIVEN an authorized request for a valid RUT
- WHEN the client receives the response
- THEN status is `200` and JSON contains only those fields with the stated types and ranges

### Requirement: Prevent protected response caching

Every score-route response (`200`, `401`, `400`, or `403`) MUST set
`Cache-Control: no-store`; sensitive score data MUST NOT be cached.

#### Scenario: [HTTP] Success and denial responses are non-cacheable

- GIVEN any protected score request
- WHEN it completes with `200`, `401`, `400`, or `403`
- THEN `Cache-Control` is `no-store`

## Scope Constraints

This capability MUST NOT add frontend behavior, persistence, database access,
external identity lookup, real scoring, or dependencies.

#### Scenario: [Unit] Scoring remains synthetic and isolated

- GIVEN the score capability is exercised with test data
- WHEN the score is calculated
- THEN it uses only the specified transformation and no database, provider, or registry operation

**Scenario evidence count:** 8 HTTP scenarios, 3 unit scenarios.
