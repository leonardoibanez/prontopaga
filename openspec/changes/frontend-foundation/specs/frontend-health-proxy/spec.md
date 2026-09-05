# Frontend Health Proxy Specification

## Purpose

Define a same-origin health status boundary for the Next.js App Router. This capability is limited to health connectivity and does not implement authentication, sessions, RUT, score, or role-based UI.

## Requirements

### Requirement: Server-only backend origin and fixed health forwarding

The server-side health route MUST read `BACKEND_URL` from server-only configuration, require an absolute `http` or `https` origin, reject an `/api` path suffix (including a trailing slash followed by `/api`), and never expose the value to browser configuration. Browser requests MUST use same-origin `GET /api/health`; the route MUST forward only to the fixed backend path `/api/health`.

#### Scenario: Valid origin forwards the canonical health path

- GIVEN `BACKEND_URL` is an absolute origin without an `/api` suffix
- WHEN the browser requests same-origin `GET /api/health`
- THEN the server requests exactly `${BACKEND_URL}/api/health`
- AND backend bearer credentials or configuration are not returned to the browser

#### Scenario: Invalid or public configuration is rejected safely

- GIVEN `BACKEND_URL` is missing, non-absolute, uses an unsupported scheme, or includes an `/api` path
- WHEN the health route is invoked
- THEN it returns a bounded client-safe error without making an upstream request
- AND the configured value is not included in the response or logs

### Requirement: Bounded, non-cacheable upstream outcomes

The route MUST use an 8-second timeout and `no-store` semantics for upstream requests and every response, including success and errors. It MUST return the upstream health success payload unchanged when valid; upstream non-success responses and invalid JSON MUST become safe `502` responses; timeout or abort MUST become a safe `504` response; and no response may expose upstream URLs, stack traces, or raw bodies.

#### Scenario: Healthy upstream is returned without caching

- GIVEN the upstream `/api/health` responds within 8 seconds with valid health JSON
- WHEN same-origin `GET /api/health` is handled
- THEN the response is successful with the health payload
- AND response headers request `no-store`

#### Scenario: Upstream failure and malformed payload are bounded

- GIVEN the upstream returns a non-success status or invalid JSON
- WHEN the route handles the request
- THEN it returns status `502` with a stable safe error shape
- AND the response has `no-store` semantics without raw upstream details

#### Scenario: Upstream timeout is bounded

- GIVEN the upstream does not complete within 8 seconds
- WHEN the timeout aborts the request
- THEN the route returns status `504` with a stable safe error shape
- AND no upstream URL, stack trace, or raw body is disclosed

### Requirement: Spanish client status, retry, and cancellation

The health client MUST call same-origin `/api/health`, preserve the existing Spanish light-teal plain-CSS presentation, expose loading/success/error status in Spanish, provide a retry action after failure, and cancel or ignore stale requests when the component unmounts or a newer retry supersedes an older request.

#### Scenario: Client reports success and retries failures

- GIVEN the client is mounted and the same-origin health route responds
- WHEN the request succeeds or fails
- THEN Spanish status text reflects the current state
- AND a failed state offers a retry that starts a new request without changing the backend contract

#### Scenario: Cancellation prevents stale updates

- GIVEN an in-flight health request exists
- WHEN the component unmounts or the user retries before it completes
- THEN the prior request is aborted or its result is ignored
- AND stale data cannot overwrite the current status
