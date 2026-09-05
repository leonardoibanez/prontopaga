# Proposal: Backend Authentication

## Intent

Add a trusted backend identity boundary. Stage 3 authenticates fixed synthetic users, issues short-lived access tokens, and exposes reusable authentication primitives without persistence or product authorization behavior.

## Scope

### In Scope
- Add literal `POST /login` accepting only `{ username, password }` and returning `{ access_token, token_type: "Bearer", expires_in: 900 }`.
- Validate DTOs at runtime; malformed bodies and extra `role`/`rut` fields return `400`, while all invalid credentials return the same `401` response.
- Issue HS256 JWTs through `@nestjs/jwt`, requiring `JWT_SECRET` with no fallback; claims are `sub`, `role`, `iat`, `exp`, plus server-derived `rut` for users only.
- Define one administrator and two synthetic users, plus export a reusable authentication guard and typed principal.
- Add `node:test` HTTP coverage through the shared effective bootstrap while preserving `GET /api/health`.

### Out of Scope
- Score routes, refresh tokens, registration, database persistence, frontend work, external identity lookup, and production identity provisioning.

## Capabilities

### New Capabilities
- `backend-authentication`: Login validation, synthetic credential verification, JWT issuance/verification, authenticated-principal typing, and denial behavior.

### Modified Capabilities
- `backend-bootstrap`: Apply the effective validation and configuration boundary consistently in production and HTTP tests while preserving health behavior.

## Approach

Add an isolated NestJS authentication module with explicit DTOs, service-owned synthetic identities, JWT signing, and a bearer-token guard. Inject configuration so tests do not mutate global `process.env` per case. Reject absent, tampered, expired, wrong-algorithm, or malformed-claim tokens uniformly with `401`.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `backend/src/auth/` | New | DTO, identities, login service/controller, JWT guard, principal type |
| `backend/src/app.module.ts` | Modified | Register authentication infrastructure |
| `backend/src/bootstrap.ts` | Modified | Shared validation/configuration behavior |
| `backend/test/` | Modified | Login and guard integration coverage |
| `backend/package.json` | Modified | Maintained NestJS validation/JWT dependencies |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Demo credentials mistaken for production identity | Medium | Document synthetic-only constraints; no registration or persistence |
| Weak or misconfigured token signing | Medium | Required secret, HS256 allow-list, strict claim validation, negative tests |
| Bootstrap drift between runtime and tests | Low | Exercise HTTP behavior through the shared bootstrap |

## Rollback Plan

Revert the stage 3 conventional commit; health and the archived stage 1–2 capabilities remain intact.

## Dependencies

- `@nestjs/jwt`, `class-validator`, and `class-transformer`, compatible with the installed NestJS stack.

## Success Criteria

- [ ] Valid synthetic credentials receive the exact 900-second bearer-token contract.
- [ ] Invalid payloads, credentials, tokens, algorithms, and claims produce the specified `400`/`401` responses.
- [ ] `npm test`, `npm run build -w backend`, and `npm run typecheck -w backend` pass under Node 24.
