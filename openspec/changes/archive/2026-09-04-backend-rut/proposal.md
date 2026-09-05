# Proposal: Backend RUT Utility

## Intent

Provide a small, deterministic backend capability for parsing, normalizing, formatting, and validating Chilean RUT values before later application features depend on them.

## Scope

### In Scope
- Add one pure TypeScript RUT utility with no framework or I/O dependencies.
- Accept dotted, unpunctuated-with-hyphen, and compact forms, including `k` or `K` verification digits.
- Normalize accepted inputs, produce canonical dotted formatting, and verify the Chilean modulo-11 checksum.
- Add backend `node:test` unit coverage while retaining the eight foundation tests.

### Out of Scope
- HTTP endpoints, NestJS providers/controllers, authentication, financial scoring, persistence, frontend changes, or new dependencies.
- SII registration or legal-identity lookup; validation covers syntax and checksum only.

## Capabilities

### New Capabilities
- `rut-validation`: Pure parsing, normalization, canonical formatting, syntax validation, and modulo-11 checksum verification for Chilean RUT values.

### Modified Capabilities
- None.

## Approach

Create one pure utility under `backend/src/rut/` and a focused `node:test` suite. Treat accepted structure strictly: a positive 1–8 digit body without leading zeros, followed by `0–9` or `K`; dotted input must be well grouped; surrounding/internal whitespace and arbitrary characters are rejected rather than stripped. Canonical output uses grouped dots, a hyphen, and uppercase `K`. These are technical defaults, not a legal identity rule.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/src/rut/` | New | Pure RUT utility. |
| `backend/test/rut.test.cjs` | New | Syntax, formatting, normalization, checksum, and regression cases. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Invalid values accepted through permissive cleanup | Medium | Parse only explicit supported forms and reject malformed structure. |
| Checksum examples encoded incorrectly | Low | Assert `12.345.678-9` invalid and `12.345.678-5` valid. |

## Rollback Plan

Remove the utility and its unit-test file; no API, persisted data, dependencies, or existing contracts change.

## Dependencies

- Existing TypeScript compiler and Node 24 `node:test` runner only.

## Success Criteria

- [ ] Supported forms normalize to one canonical representation and malformed inputs are rejected.
- [ ] Modulo-11 verification handles numeric and `K` digits, including the confirmed examples.
- [ ] Root `npm test` passes the new suite and all eight foundation tests.
