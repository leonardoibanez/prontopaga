# Design: Backend Authentication

## Technical Approach

Add a dynamic `AuthModule` behind the shared bootstrap. `parseBootstrapConfig` validates `JWT_SECRET`; `createApplication` passes `BootstrapConfig` through `AppModule.register` to `AuthModule.register`. The module owns three synthetic identities, login, HS256 issuance, strict verification, and an exported principal/guard. No production protected route is added.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Configuration | Required `jwtSecret` in `BootstrapConfig`; dynamic App/Auth modules with value-provider DI | Read `process.env` in auth; ConfigModule | One production/test boundary without a new dependency or global test mutation. Reject absent, empty, or whitespace-only secrets; no fallback. |
| Route | `@Controller('login')/@Post()` plus `setGlobalPrefix('api', { exclude: [{ path: 'login', method: RequestMethod.POST }] })` | `/api/login`; broad wildcard exclusion | Produces literal `POST /login` only while preserving `GET /api/health`; method-specific exclusion avoids accidental public routes. |
| Input boundary | Global strict `ValidationPipe`; JSON limit 16 KiB; `username` string length 3–64, `password` 8–128 | Type-only DTO; implicit coercion | `transform`, whitelist, unknown-field rejection, hidden values, and disabled implicit conversion yield `400`; oversized input is `413`. |
| Demo identities | One injected singleton catalog; exact accounts below; plaintext demo passwords documented as non-production | Persistence, hashing, external IdP | Scope explicitly requires fixed synthetic credentials. Central lookup lets issuance and verification bind claims to known server records. |
| Token validation | Explicit HS256/900 seconds; validate shape, times, and catalog binding; reconstruct principal | Decode-only; trust signed claims | A valid signature alone permits claim drift. All failures become the same `401`. |

Synthetic records: `synthetic-admin-001` / `demo.admin` / `AdminDemo!2026` / `admin` (no RUT); `synthetic-user-001` / `demo.user1` / `UserOneDemo!2026` / `user` / `12345678-5`; `synthetic-user-002` / `demo.user2` / `UserTwoDemo!2026` / `user` / `9876543-3`. Both RUTs pass the existing utility. These are demo data, not production identities.

## Data Flow

```text
environment -> parseBootstrapConfig -> AppModule.register -> AuthModule/JwtModule
POST /login -> ValidationPipe -> identity catalog -> AuthService -> HS256 token
Bearer header -> AuthGuard -> signature/claims -> catalog binding -> request.user
```

## File Changes

| File | Action | Description |
|---|---|---|
| `backend/src/auth/{auth.module,auth.controller,auth.service,auth.guard,auth.types,login.dto,synthetic-identities}.ts` | Create | Dynamic module, strict login, identity catalog, token guard, and exported contracts. |
| `backend/src/{app.module,bootstrap}.ts` | Modify | Dynamic wiring, secret parsing, validation, body limit, and literal prefix exclusion. |
| `backend/test/auth.test.cjs` | Create | HTTP login and direct guard behavior. |
| `backend/test/health.test.cjs` | Modify | Inject a synthetic test secret and retain health/bootstrap coverage. |
| `backend/{package.json,.env.example}`, `package-lock.json`, `README.md` | Modify | Pin dependencies; blank secret placeholder and generation command; Spanish demo limitation/credentials. |

Pin `@nestjs/jwt` `12.0.1`, `class-validator` `0.15.1`, and `class-transformer` `0.5.1`. Official metadata supports Nest 11 (`@nestjs/jwt` accepts Common 8–12; Nest accepts validator `>=0.13.2` and transformer `>=0.4.1`). No design-time install.

## Interfaces / Contracts

```ts
type AuthenticatedPrincipal =
  | { readonly sub: string; readonly role: 'admin' }
  | { readonly sub: string; readonly role: 'user'; readonly rut: string };
type LoginResponse = { access_token: string; token_type: 'Bearer'; expires_in: 900 };
```

JWT claims are exactly server-derived `sub`, `role`, optional user-only normalized `rut`, plus library-produced integer `iat`/`exp`, with `exp - iat === 900`. The guard requires non-empty known `sub`; exact role/RUT agreement; no admin `rut`; valid normalized user RUT; `iat <= now < exp`; and HS256. It attaches only the reconstructed principal.

## Testing Strategy

Strict TDD is behavioral RED first: compiling tests/stubs, assertion failures, then GREEN/refactor. HTTP tests cover route/prefix, each role, generic credential `401`, invalid/extra/oversized bodies, missing secret, and health. Guard tests resolve the guard from the app and use a mock `ExecutionContext`; cover valid principal plus absent, malformed, tampered, expired, wrong-algorithm, invalid times, unknown `sub`, and role/RUT drift. No test-only production route. Run only `npm test`, `npm run build -w backend`, and `npm run typecheck -w backend` under Node 24.

## Threat Matrix

HTTP routing changes, so the supplied matrix was reviewed:

| Boundary | Applicability | Design response | Planned RED tests |
|---|---|---|---|
| Documentation-like paths | N/A — no file classification/execution | None | None |
| Git repository selection | N/A — no Git operation | None | None |
| Commit state | N/A — no commit automation | None | None |
| Push state | N/A — no push automation | None | None |
| PR commands | N/A — no PR automation | None | None |

HTTP safe behavior is the method-bound exclusion; RED tests prove `POST /login`, reject `/api/login` as the login contract, and preserve `/api/health`.

## Migration / Rollout

No data migration or feature flag. Deployment must provide a non-empty `JWT_SECRET`; `.env.example` keeps its value blank and README documents a local secret-generation command. Rollback is the stage commit.

## Open Questions

None.

Sources: [NestJS authentication](https://docs.nestjs.com/security/authentication), [NestJS validation](https://docs.nestjs.com/techniques/validation).
