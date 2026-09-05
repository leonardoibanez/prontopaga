# Apply Progress: Complete Backend Delivery Evidence

**Change:** `backend-delivery`
**Artifact store:** hybrid
**Apply state:** complete — 12 of 12 tasks marked complete
**Mode:** Strict TDD configured; documentation-only exception applied. No production or test code changed, so no artificial RED/GREEN cycle was created. Structural readback is the configured proof for this documentation-only work.

## Completed tasks

- [x] 1.1 Ran and recorded exact status for backend build, backend typecheck, backend workspace tests, and root tests.
- [x] 1.2 Ran the isolated, backend-only clean-install and direct-child runtime smoke flow; terminated/reaped its child and removed the temporary directory.
- [x] 1.3 Completed a focused read-only review of error and credential-exposure surfaces, recording no demonstrated defect and explicit limits.
- [x] 1.4 Inventoried all 30 actual `node:test` names for the requirements matrix.
- [x] 1.5 Found no runtime defect; source and tests remained read-only, so no RED/GREEN/REFACTOR code task was opened.
- [x] 2.1 Updated `README.md` with the Spanish backend-only quick path and detailed-guide link.
- [x] 2.2 Created `docs/backend-delivery.md` with synthetic identities, exact routes/curls, response outcomes, RUT correction, UTC/no-store contract, and SHA-256 caveats.
- [x] 2.3 Added the actual-test-name matrix, four-command evidence, bounded review, isolated smoke evidence, cleanup record, preservation boundaries, and AI declaration.
- [x] 2.4 Stated the excluded persistent harness, frontend, PDF, `.gitignore`, real `.env`, database, provider, and speculative hardening scope.
- [x] 3.1 Read both Markdown files back; verified all 30 test names, commands, routes, required AI names, and no actual token/secret leakage.
- [x] 3.2 Confirmed only `README.md` and `docs/backend-delivery.md` are implementation edit targets; source/tests/config/PDF/frontend were preserved.
- [x] 3.3 Prepared the stage-5 commit handoff; parent owns the single conventional commit after archive, with no push, PR, or receipt-driven review.

## Command evidence

All commands ran from `/Users/leonardo/Dev/prontopaga` with `PATH=/tmp/node-v24.20.0-darwin-arm64/bin:$PATH` (Node 24.20.0).

| Exact command | Exit | Observed result | SHA-256 of captured output |
| --- | --- | --- | --- |
| `npm run build -w backend` | 0 | Build passed | `017a6a91cbab5e2cc77a20f2093d3df2b964921561dfd398b7c237c94e40d7fe` |
| `npm run typecheck -w backend` | 0 | Typecheck passed | `9e740f88053be81bd013f40e4e863c37e7287ba648a790a2fa548ae31e280c5d` |
| `npm test -w backend` | 0 | 30 pass, 0 fail | `90736e23a5f99248b172f3bd2c01fef5113d1e2e9b5c23eaef4d51a0c1eeb748` |
| `npm test` | 0 | 30 pass, 0 fail | `2ec9f33d25010e1414184352d09f2c4f148b4faa1a8c834e927102ba154f44fb` |

## Isolated runtime evidence

The smoke workspace was created from `git archive HEAD package.json package-lock.json .nvmrc backend`, so it contained tracked root manifests and backend only. It had no frontend directory and no real environment file. A generated secret existed only in the process environment and was not printed.

| Evidence | Result |
| --- | --- |
| Scoped clean install | `npm ci --workspace backend --include-workspace-root`: exit 0; output SHA-256 `577d73d9df54afa438509d3e2d68d8afc81862a86436381bc3fab1f05e2deb3d`; frontend absent |
| Runtime target | `backend/package.json` defines `start` as `node dist/main.js`; smoke ran that exact Node target at backend cwd directly so the child PID could be retained and reaped |
| Child lifecycle | PID `23317` on temporary port `32167`; `TERM` sent, `wait` completed, and later cleanup confirmed no child remained |
| HTTP results | Health 200; login 200; own score 200 (`12.345.678-5`, score 87, UTC ISO date, `Cache-Control: no-store`); missing token 401; invalid token 401; cross-user 403; authenticated invalid RUT 400 |
| Cleanup | Temporary directory removed; runtime-log SHA-256 `382689363e3ac2d01a7b7ec0ee0fada6ef651cfe4654c266ad853b3df0747ca8` |

## Focused review

Read-only surfaces: bootstrap, auth, RUT, score, health, all backend tests, synthetic identities, `backend/.env.example`, `.gitignore`, root/backend package manifests, and tracked configuration. No credential or error-path defect was demonstrated by this review, regression commands, or runtime smoke. The review does not cover TLS, rate limiting, deployment, persistent storage, secret rotation, SSO, multitenancy, production dependencies, or external systems; it does not claim complete security or production readiness.

## Work Unit Evidence

| Work unit | Focused test command and result | Runtime harness and result | Rollback boundary |
| --- | --- | --- | --- |
| Backend-only evidence and Spanish delivery guide | `npm test`: exit 0, 30 pass, 0 fail; plus build/typecheck/backend-test all exit 0 | Isolated clean-install, direct production child, and redacted curl scenario: passed; PID reaped and tempdir removed | Revert only `README.md` and `docs/backend-delivery.md`; source/tests were not changed |

## TDD Cycle Evidence

| Task group | RED | GREEN | REFACTOR / structural proof |
| --- | --- | --- | --- |
| 1.1–1.5 evidence and read-only review | N/A — no behavior was changed and no defect was proven | Existing four commands and 30 tests passed | Source/tests untouched; bounded review and temporary runtime evidence recorded |
| 2.1–2.4 documentation | N/A — documentation-only work must not fabricate a failing behavioral test | N/A — no production code was changed | Both Markdown files read back; command/route/AI requirements and 30 test names matched the repository |
| 3.1–3.3 readback and handoff | N/A — no behavior was changed | N/A — no production code was changed | `git diff --check` passed; protected backend/config/frontend/PDF paths had no implementation delta |

## Deviations from design

None. The design specified documentation-only delivery unless a concrete backend defect was proven; no defect was proven, so no source or test modification occurred.

## Files changed

| File | Action | Purpose |
| --- | --- | --- |
| `README.md` | Modified | Short Spanish backend-only quick path and link to the detailed guide |
| `docs/backend-delivery.md` | Created | Authoritative Spanish delivery, contract, evidence, limitations, and AI declaration |
| `openspec/changes/backend-delivery/tasks.md` | Modified | All completed task checkboxes persisted for the OpenSpec half of hybrid storage |
| `openspec/changes/backend-delivery/apply-progress.md` | Created | Cumulative apply evidence for the OpenSpec half of hybrid storage |

## Workload and delivery

- Mode: `exception-ok` / `size:exception`
- Current work unit: Backend-only evidence and Spanish delivery guide
- Boundary: documentation and delivery evidence only; no source, tests, frontend, PDF, `.gitignore`, real `.env`, database, provider, deployment, or persistent harness.
- Authored documentation size: 200 lines across `README.md` and `docs/backend-delivery.md`; task/artifact overhead excluded.
- Commit handoff: parent performs one conventional stage-5 commit after archive. No push, PR, or receipt-driven review is authorized by this apply stage.

## Verification readiness

Ready for independent `sdd-verify`. All 12 tasks are visibly checked in `openspec/changes/backend-delivery/tasks.md`; progress is persisted in both required hybrid locations once the paired Engram observation is saved.
