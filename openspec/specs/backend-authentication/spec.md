# Backend Authentication Specification

## Purpose

Define the backend's synthetic-user login boundary, short-lived access tokens, and reusable bearer authentication primitives. This capability does not add persistence, registration, refresh, score routes, or frontend behavior.

## Requirements

### Requirement: Strict login contract

The backend MUST expose `POST /login` accepting exactly a JSON object with `username` and `password` fields. A valid request MUST return HTTP `200` with `access_token`, `token_type: "Bearer"`, and `expires_in: 900`. Malformed bodies, missing or invalid fields, and any extra field including `role` or `rut` MUST return HTTP `400`.

#### Scenario: Valid login returns the bearer contract

- GIVEN a request contains exactly valid `username` and `password` values
- WHEN the client posts to `/login`
- THEN the response is `200` with a bearer access token and `expires_in` equal to `900`

#### Scenario: Client identity fields are rejected

- GIVEN a request includes `role`, `rut`, or another extra field
- WHEN the client posts to `/login`
- THEN the response is `400` and no token is issued

#### Scenario: Malformed credentials are rejected

- GIVEN the body is missing, malformed, or has invalid credential field types
- WHEN the client posts to `/login`
- THEN the response is `400` and no token is issued

### Requirement: Server-owned synthetic identities

Authentication MUST verify credentials only against exactly one server-defined administrator and two server-defined users. Role and RUT MUST be derived from the matched identity and MUST NOT be accepted from client input. Incorrect credentials MUST produce one generic HTTP `401` response without revealing whether the username or password was incorrect.

#### Scenario: Invalid credentials are indistinguishable

- GIVEN credentials do not match any synthetic identity
- WHEN the client posts to `/login`
- THEN the response is the same generic `401` contract for every invalid-credential case

#### Scenario: Identity attributes come from the server

- GIVEN a valid administrator or user credential pair
- WHEN login succeeds
- THEN the issued identity uses the server-defined role and RUT attributes, regardless of omitted or attempted client attributes

### Requirement: Strict HS256 token issuance

The backend MUST require a non-empty `JWT_SECRET` configuration value and MUST fail configuration/startup when it is absent; it MUST NOT use a fallback secret. Tokens MUST use HS256 only and contain a non-empty string `sub`, `role` equal to `admin` or `user`, numeric `iat`, numeric `exp`, and `exp - iat = 900`. User tokens MUST contain a valid normalized `rut`; administrator tokens MUST NOT contain `rut`.

#### Scenario: Claims match the server identity and lifetime

- GIVEN a valid synthetic identity and configured JWT secret
- WHEN the backend issues an access token
- THEN the token is HS256, has the required claims, and expires exactly 900 seconds after issuance

#### Scenario: Missing signing secret is fail-closed

- GIVEN `JWT_SECRET` is absent or empty
- WHEN production or test bootstrap initializes
- THEN initialization fails rather than issuing tokens with a fallback secret

### Requirement: Reusable bearer verification

The backend MUST export a reusable authentication guard and typed authenticated principal. The guard MUST reject absent, malformed, tampered, expired, wrong-algorithm, or invalid-claim tokens with HTTP `401`; it MUST attach only a verified principal on success. This stage MUST NOT add a score or other protected product route.

#### Scenario: Valid bearer token is accepted

- GIVEN a bearer token issued by the backend with valid HS256 signature and claims
- WHEN the reusable guard evaluates it
- THEN verification succeeds and the typed principal contains the verified server identity

#### Scenario: Invalid bearer tokens are denied uniformly

- GIVEN the token is absent, tampered, expired, uses another algorithm, or has invalid required claims
- WHEN the reusable guard evaluates it
- THEN it rejects with `401` and does not expose an authenticated principal
