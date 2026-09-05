# Proposal: Protected Synthetic Score Consultation

## Intent

Add the approved stage 4 backend endpoint so authenticated clients can consult a deterministic synthetic score for a valid Chilean RUT without exposing cross-user data or implying a real financial-risk model.

## Scope

### In Scope
- Add `GET /score/:rut` at the literal HTTP root (not under `/api`), protected by the existing bearer guard.
- Allow a user to consult only their own normalized RUT; allow an administrator to consult any valid RUT.
- Return HTTP `200` with exactly `{ rut, score, fecha }`, a canonical dotted uppercase-`K` RUT, a deterministic `0..100` score, and a per-request UTC ISO timestamp.
- Return `401` for invalid authentication before RUT disclosure, `400` for an authenticated invalid RUT, and `403` for another valid RUT.
- Mark authenticated score responses `Cache-Control: no-store`.

### Out of Scope
- Real scoring models, databases, providers, external identity lookup, or persistence.
- Frontend work, new dependencies, public score access, or changes to existing authentication and RUT contracts.

## Capabilities

### New Capabilities
- `backend-score`: Protected, authorized, deterministic synthetic score consultation.

### Modified Capabilities
- None.

## Approach

Create a focused NestJS score module that reuses the exported authentication principal/guard and pure RUT utilities. Authenticate first, validate and normalize the RUT, authorize ownership, then compute SHA-256 over the normalized undotted value with its hyphen retained. Interpret the first four digest bytes as unsigned big-endian and apply modulo `101`. Generate `fecha` at consultation time.
Hash collisions are acceptable.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/src/score/` | New | Controller, authorization, and deterministic scoring use case |
| `backend/src/app.module.ts` | Modified | Register the score module |
| `backend/test/` | Modified | Unit and HTTP contract coverage |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Authorization leaks RUT validity | Medium | Authenticate before validation; authorize before computation |
| Platform-dependent scoring | Low | Fix digest slice, byte order, normalization, and modulo |
| Sensitive responses cached | Low | Apply `no-store` across the protected route boundary |

## Rollback Plan

Revert the stage 4 commit, removing the score module registration, implementation, and tests while preserving archived authentication and RUT capabilities.

## Dependencies

- Archived backend authentication (`679b156`) and RUT utility (`b90627a`).
- Existing Node crypto support; no package dependency is added.

## Success Criteria

- [ ] HTTP outcomes and exact success payload match the approved contract.
- [ ] Scores are stable across calls, instances, and time; `fecha` is fresh UTC ISO data.
- [ ] Root `npm test`, backend build, and backend typecheck pass under Node 24.
