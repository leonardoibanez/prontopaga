# Tasks: Complete Backend Delivery Evidence

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated authored changed lines | 450–650 docs lines; task/artifact overhead excluded |
| 400-line budget risk | High |
| Chained PRs recommended | No |
| Suggested split | One size-exception unit; parent commits after archive |
| Delivery strategy | exception-ok |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|---|---|---|---|---|---|
| 1 | Backend-only evidence and Spanish delivery guide | Single PR (size-exception) | PATH=/tmp/node-v24.20.0-darwin-arm64/bin:$PATH npm test plus backend build/typecheck/test commands | Temporary workspace copied from tracked manifests and `backend/` (read-only); clean install, build, start, redacted curls, exact PID and tempdir cleanup | Revert `README.md` and `docs/backend-delivery.md` only |

## Phase 1: Evidence and bounded review

- [x] 1.1 Run and record exact status for npm run build -w backend, npm run typecheck -w backend, npm test -w backend, and npm test.
- [x] 1.2 In an untracked temporary workspace, copy tracked root manifests and `backend/` (read-only), clean-install backend dependencies with no secrets in logs, generate an in-memory JWT_SECRET, build/start, run health/login/score curls, then terminate the exact PID and remove the tempdir.
- [x] 1.3 Review error/credential exposure across `backend/src/` (read-only), `backend/test/` (read-only), logs, fixtures, `backend/.env.example` (read-only), `.gitignore` (read-only), and tracked configuration; record findings, redacted evidence, and unreviewed risks.
- [x] 1.4 Inventory all 30 exact node:test names from `backend/test/*.test.cjs` (read-only) for the requirements matrix; make no coverage or complete-security claim.
- [x] 1.5 If a runtime defect is proven, pause and refresh tasks with the exact path, behavioral RED test, smallest GREEN fix, and REFACTOR step; otherwise keep source/tests read-only.

## Phase 2: Documentation implementation

- [x] 2.1 Update `README.md` with the Spanish backend-only quick path: Node 24, root workspace install, generated non-empty JWT_SECRET, root working directory, build/start, scope boundaries, and link to the detailed guide.
- [x] 2.2 Create `docs/backend-delivery.md` as the authoritative Spanish guide: synthetic credentials, /api/health, root /login and /score/:rut curls, 200/400/401/403 outcomes, UTC fecha, no-store, invalid versus canonical PDF RUT, and synthetic SHA-256 goldens 87/33/83 caveat.
- [x] 2.3 Add the actual-test-name matrix, four-command evidence, bounded review record, fresh-developer install/generated-secret/build/start/curl statuses, cleanup evidence, preservation boundaries, and AI tools/areas declaration.
- [x] 2.4 State that no persistent harness, frontend, PDF, `.gitignore`, real `.env`, database, provider, or speculative hardening is added; keep URLs/routes and temporary paths in plain prose where backticks could be misread.

## Phase 3: Readback and delivery handoff

- [x] 3.1 Read back both Markdown files, verify commands/routes/statuses and matrix names against read-only source/test files, and inspect the diff for secret/token/PII leakage.
- [x] 3.2 Confirm only `README.md` and `docs/backend-delivery.md` are implementation edit targets; preserve all other files and report exact final four-command results and runtime cleanup.
- [x] 3.3 Prepare the final conventional stage-5 commit handoff with exact evidence, scope, and rollback boundaries; parent performs that commit after archive, with no push, PR, receipt-driven review, or additional harness.
