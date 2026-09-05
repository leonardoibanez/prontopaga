# Design: Protected Synthetic Score Consultation

## Technical Approach

Add a small `ScoreModule` around one controller and one service. The controller is protected by the existing `AuthGuard`; the service validates and normalizes the RUT, enforces ownership, then invokes injected calculation and clock functions. The bootstrap excludes only `GET score/:rut` from the global `/api` prefix. Route-scoped middleware sets `Cache-Control: no-store` before guards run, so denials and successes share the cache policy.

## Architecture Decisions

| Decision | Alternatives considered | Rationale |
|---|---|---|
| Register `AuthModule.register(config)` once and pass that `DynamicModule` into `ScoreModule.register(authModule)` | Re-register auth in both modules; make auth global | The nested import keeps `POST /login` registered and makes exported `AuthGuard`, `JwtModule`, and identity providers resolvable without duplicating JWT-secret configuration or creating global coupling. |
| Use route-scoped Nest middleware for `no-store` | Controller header decorator; interceptor; global middleware | Middleware runs before guards, so `401` responses receive the header. The method-and-path matcher limits the policy to `GET score/:rut`; a controller-only header cannot cover guard failures. |
| Keep validation, authorization, calculation, and timestamp creation in ordered `ScoreService.consult` steps | Authorization guard reading raw route params; controller business logic | Guards precede pipes, so parameter-dependent authorization there risks validating raw input incorrectly. The service establishes one auditable order after authentication and avoids computing protected output for denied requests. |
| Inject narrow calculator and clock function tokens | Mock Node crypto/time globally; introduce repositories or domain layers | These are the only variable effects needed to prove ordering and freshness. Function tokens are sufficient test seams without adding packages or speculative abstractions. |

## Data Flow

```text
GET /score/:rut -> no-store middleware -> AuthGuard -> ScoreController
  -> validate/normalize -> authorize principal -> SHA-256 score -> UTC clock -> response
```

Failures stop at their step: authentication `401`, invalid RUT `400`, ownership `403`. Calculation and clock are unreachable on every denial path.

## File Changes

| File | Action | Description |
|---|---|---|
| `backend/src/score/score.module.ts` | Create | Register auth dependency, controller/service/providers, and exact GET middleware. |
| `backend/src/score/score.controller.ts` | Create | Define guarded `GET /score/:rut` transport adapter and exact response projection. |
| `backend/src/score/score.service.ts` | Create | Validate, authorize, calculate, timestamp, and expose calculator/clock DI tokens. |
| `backend/src/app.module.ts` | Modify | Compose one dynamic auth module through `ScoreModule.register`. |
| `backend/src/bootstrap.ts` | Modify | Add only the method-specific `GET score/:rut` prefix exclusion. |
| `backend/test/score.test.cjs` | Create | Unit and HTTP contract coverage. |
| `README.md` | Modify | Add concise authenticated score usage and remove the stale “no protected routes” statement; full product documentation remains stage 5. |

## Interfaces / Contracts

`ScoreService.consult(rut, principal)` returns `{ rut: string; score: number; fecha: string }`. The calculator receives canonical undotted input with the hyphen retained (for example `1009-K`), hashes its UTF-8 bytes with SHA-256, reads digest bytes `0..3` as unsigned big-endian, and returns the value modulo `101`. Output RUT uses dotted form and uppercase `K`. The clock returns a `Date`, serialized with `toISOString()` per authorized request.

## Testing Strategy

Strict TDD starts with meaningful failing behavioral assertions, never an import failure and never a provisional public route. Unit tests inject calculator/clock spies and prove invalid and unauthorized requests call neither; authorized calls invoke both once and preserve order. Hard-coded independent goldens include `12345678-5 -> 87`, `9876543-3 -> 33`, and lowercase-`k` equivalence `6-k -> 83`/`6-K`.

HTTP tests cover `401/400/403/200`, exact three-field payloads, all outcomes carrying `no-store`, `/score/:rut` versus `/api/score/:rut`, and unchanged literal `/login` plus `/api/health`. They compare scores across two application instances and distinct request times while asserting fresh ISO timestamps. Verification commands are root `npm test`, `npm run build -w backend`, and `npm run typecheck -w backend`.

## Threat Matrix

Routing changes, so the matrix was assessed. Documentation-like paths, Git repository selection, commit state, push state, and PR commands are all **N/A**: this endpoint neither classifies executable files nor invokes shell, VCS, PR, subprocess, or process-integration boundaries. Route/auth/cache adversarial cases are covered by the HTTP RED tests above.

## Migration / Rollout

No data migration, dependency, database, frontend, feature flag, or real scoring rollout is required. Stage 4 remains one `exception-ok` delivery unit; no PR chain is planned. Rollback removes module registration, route code, tests, and the concise README update.

## Open Questions

None.
