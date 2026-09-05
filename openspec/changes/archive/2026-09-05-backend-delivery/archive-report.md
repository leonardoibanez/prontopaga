# Archive Report: backend-delivery

**Schema**: `gentle-ai.sdd-archive/v1`
**Change**: `backend-delivery`
**Archived**: `2026-09-05`
**Artifact store**: hybrid
**Final status**: archived
**Native final state**: archived
**Native archive readiness**: `dependencies.archive: ready`; `nextRecommended: archive`; `blocked[]`
**Post-archive native status**: `dependencies.archive: all_done`; `nextRecommended: archived`; `blockedReasons: []`
**Verification settlement**: complete
**Verification verdict**: pass_with_warnings
**Evidence revision**: `sha256:cefa9f61b5705eb5525142ebfff9523165facebc4464085e39461e4e8c1fddfa`
**Persisted report evidence**: `sha256:be9463e3fe4677944561e27c21ef0f3c3b8d35a489a03181da228183569fb8ac`

## Final State

The backend-delivery stage 5 change is archived after native SDD status reported archive readiness, no blocked reasons, and complete verification settlement. The final evidence covers all `5/5` requirements, `6/6` scenarios, `12/12` implementation tasks, and `30` passing backend tests. All four required root-scoped commands passed:

| Exact command | Exit | Observed result |
|---|---:|---|
| `npm run build -w backend` | 0 | Passed |
| `npm run typecheck -w backend` | 0 | Passed |
| `npm test -w backend` | 0 | 30 passed, 0 failed, 0 skipped |
| `npm test` | 0 | 30 passed, 0 failed, 0 skipped |

The final clean-install smoke evidence completed every intended install, build, startup, HTTP contract, and cleanup assertion. Its intentional `SIGTERM` shutdown returned `wait` status 143 under `set -e` before summary emission; this is retained as a verification-harness warning, not an application failure. No exit-zero result or output hash is invented for that final smoke invocation. The earlier apply-stage clean-install smoke had a separate clean exit 0 and is not conflated with this final warning. Cleanup was confirmed.

A previous ambient-shell `node --version` diagnostic returned 127 because the standard PATH lacked Node. The supplied Node 24.20.0 runtime corrected that environment-only invocation; it is not a production defect. The project context now records a portable Node 24 requirement rather than a mandatory temporary global path.

No backend application, backend test, build output, frontend, PDF, `.gitignore`, real environment file, or persistent harness was added or changed during the final archive stage. Archive performed metadata/spec synchronization and mechanical movement only. All backend stages are complete; no new feature work is introduced.

## Artifacts Read

| Artifact | Filesystem locator | Engram observation |
|---|---|---:|
| Project initialization | `openspec/config.yaml` | `#8` (`sdd-init/prontopaga`, refreshed final context) |
| Testing capabilities | `openspec/config.yaml` | `#6` (`sdd/prontopaga/testing-capabilities`, refreshed final context) |
| Proposal | `openspec/changes/backend-delivery/proposal.md` | `#72` |
| Delta specification | `openspec/changes/backend-delivery/specs/backend-delivery/spec.md` | `#73` |
| Design | `openspec/changes/backend-delivery/design.md` | `#74` |
| Tasks | `openspec/changes/backend-delivery/tasks.md` | `#77` (refreshed with all 12 checked tasks) |
| Apply progress | `openspec/changes/backend-delivery/apply-progress.md` | `#78` |
| Verify report | `openspec/changes/backend-delivery/verify-report.md` | `#83` |

All required artifacts were read from both hybrid backends where available. The persisted task artifact had no unchecked implementation tasks before synchronization or movement.

## Spec Sync

No prior main specification existed for the `backend-delivery` domain. The delta specification was copied mechanically:

- Source: `openspec/changes/backend-delivery/specs/backend-delivery/spec.md`
- Main specification: `openspec/specs/backend-delivery/spec.md`
- `NEW_SPEC_DIFF_STATUS=0`
- `POST_SYNC_DIFF_STATUS=0`

The main specification is now the source of truth for `backend-delivery`. Existing specifications for `backend-authentication`, `backend-bootstrap`, `backend-score`, and `rut-validation` were preserved.

## Archive Move

The active change tree was moved to:

`openspec/changes/archive/2026-09-05-backend-delivery/`

The destination was checked for collision before movement. `git mv` was attempted and returned status 128 because the untracked OpenSpec source directory had no tracked source; the permitted plain `mv` fallback was used after validating the pre-move snapshot.

Verbatim mechanical readback statuses:

```text
NEW_SPEC_DIFF_STATUS=0
POST_SYNC_DIFF_STATUS=0
GIT_MV_STATUS=128
FALLBACK_SOURCE_DIFF_STATUS=0
POST_MOVE_DIFF_STATUS=0
```

Both required recursive comparisons emitted no differences. The active source directory no longer exists. The archive contains proposal, delta specs, design, tasks, apply-progress, verify-report, instance metadata, and this additive archive report. The archive report was created after the pre-move snapshot and is excluded from the source/destination byte-identity comparison.

## Scope and Delivery Boundaries

This archive closes backend-delivery stage 5 and the complete backend staged delivery sequence. The change remains backend-only and documentation/evidence-focused. Strict TDD remains configured; because no runtime defect was demonstrated and no source or test code changed, the documentation-only structural proof is retained rather than fabricating a RED-GREEN-REFACTOR cycle.

The final stage did not run application tests, builds, installs, or smoke commands; it preserved the already-settled verification evidence and performed no runtime mutation. The parent orchestrator is authorized to create the single conventional closing commit after archive. No commit hash is asserted here, and no push, pull request, receipt-driven review, frontend work, or future commit is required for archive completion.

## Result

The hybrid archive is complete with native final state `archived`. The synchronized main specification and dated archive preserve the final audit trail, including exact four-command evidence, the bounded smoke warning, environment diagnosis, cleanup confirmation, and preservation boundaries. No further SDD phase is recommended for this change.
