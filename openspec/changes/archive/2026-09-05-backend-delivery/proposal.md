# Proposal: Complete Backend Delivery Evidence

## Intent

Finish the backend-only challenge with reproducible onboarding, regression evidence, and a focused error/credential-exposure review so a fresh developer can run and assess it without guessing configuration or routes.

## Scope

### In Scope
- Run the complete backend regression and record exact build, typecheck, workspace-test, and root-test evidence.
- Review error paths, responses, logs, fixtures, and tracked configuration for credential exposure; fix only demonstrated defects.
- Consolidate Spanish backend-only setup and curl examples for login, successful score lookup, and `401`/`403`/`400` outcomes.
- Document synthetic accounts, Node 24/npm workspaces, local `JWT_SECRET` generation, workspace startup, UTC `fecha`, and the required AI-use declaration.
- Add a requirements evidence matrix using actual test names.

### Out of Scope
- Database, real financial models, production authentication, SSO, multitenancy, deployment, frontend integration, broad hardening, or large dependencies.
- Push, PR, receipt-driven review, or modification of the original PDF, `.gitignore`, frontend, or a real `.env`.

## Capabilities

### New Capabilities
- `backend-delivery`: Reproducible backend-only setup, executable API examples, bounded security review, and traceable verification evidence.

### Modified Capabilities
- None.

## Approach

Use documentation-first delivery. Verify the NestJS implementation and 30-test suite with isolated temporary smoke values. A proven runtime defect requires a behavioral failing test before the smallest fix.

The guide must clarify that the PDF's `12.345.678-9` sample is invalid; the canonical demo RUT is `12.345.678-5`. SHA-256 goldens `87`, `33`, and `83` are deterministic synthetic outputs—not risk assessments, uniqueness guarantees, or collision-free identifiers. Per the PDF, the AI declaration must name tools used and code areas they helped generate.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `README.md`, `docs/` | Modified/New | Backend quick path, curls, caveats, AI declaration, evidence matrix |
| `backend/src/`, `backend/test/` | Conditional | Review; change only for a proven regression |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Docs drift from runtime | Medium | Exercise exact commands and examples |
| Secrets enter artifacts | Low | Generate locally; redact and clean temporary values |
| Evidence overclaims assurance | Medium | State reviewed scope and uncovered limits |

## Rollback Plan

Revert the closing conventional commit; no persistence, external service, or deployment state is changed.

## Dependencies

- Existing Node 24 workspace, backend implementation, and synthetic test data only.

## Success Criteria

- [ ] `npm run build -w backend`, `npm run typecheck -w backend`, `npm test -w backend`, and root `npm test` pass.
- [ ] Fresh-developer instructions and exact positive/negative curl flows are reproducible without real secrets.
- [ ] Evidence maps requirements to real test names and reports review limits without unsupported coverage or security claims.
