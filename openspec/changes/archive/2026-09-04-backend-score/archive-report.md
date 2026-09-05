# Archive Report: backend-score

**Schema**: `gentle-ai.sdd-archive/v1`
**Change**: `backend-score`
**Archived**: `2026-09-04`
**Artifact store**: hybrid
**Final status**: complete

## Final State

The backend-score stage 4 change is archived after native SDD status reported
`dependencies.archive: ready`, `nextRecommended: archive`, and no blocked
reasons. Native verification settlement was complete. The final verification
evidence revision is
`sha256:a1f1df79a319bb7096f81d6715f7aae513bd9bebb4a334c7c32e3266fd4b855b`.
The persisted verify report has SHA-256
`sha256:5b3c5b6b146f4070bb4862980dc10b92b6da4ea57c697d562ae413a1bf2c3bd0`.

Final evidence covers all `9/9` implementation tasks, `4/4` requirements, and
`11/11` scenarios. The current verification pass records `30` tests passed,
with the backend build and type check passed; no blockers or CRITICAL findings
remain. Coverage remains unmeasured because no backend coverage command is
declared in the cached project capability contract.

The verifier report honestly preserves three transient verifier-harness
failures before the admitted evidence. They were harness calibration issues
(body-shape expectation, temporary module resolution, and route-metadata loss),
not production failures. Corrected runtime probes then passed, and no
production source fix was required. Their bounded output hashes remain in the
archived `verify-report.md` for auditability.

## Artifacts Read

| Artifact | Filesystem locator | Engram observation |
|---|---|---|
| Proposal | `openspec/changes/backend-score/proposal.md` | filesystem read |
| Delta specification | `openspec/changes/backend-score/specs/backend-score/spec.md` | filesystem read |
| Design | `openspec/changes/backend-score/design.md` | filesystem read |
| Tasks | `openspec/changes/backend-score/tasks.md` | filesystem read |
| Apply progress | `openspec/changes/backend-score/apply-progress.md` | filesystem read |
| Verify report | `openspec/changes/backend-score/verify-report.md` | filesystem read |
| Project configuration | `openspec/config.yaml` | filesystem read |

All nine persisted implementation tasks were checked before archive; no stale
unchecked task remains. The task artifact is preserved in the archive with all
checkboxes complete.

## Spec Sync

The backend-score delta specification was mechanically copied in full because
no prior main spec existed:

- `openspec/specs/backend-score/spec.md` — created from
  `openspec/changes/backend-score/specs/backend-score/spec.md`
- Pre-copy and post-copy recursive `diff -r` readbacks were empty with exit
  status `0`.
- The archived delta and the new main specification remain byte-identical.

## Archive Move

The active change tree was moved to:

`openspec/changes/archive/2026-09-04-backend-score/`

`git mv` was attempted and returned status `128` because the untracked OpenSpec
source tree had no tracked source for Git to move (`fatal: source directory is
empty`). A pre-move recursive snapshot was compared with the source before the
permitted plain `mv` fallback; that `diff -r` was empty with exit status `0`.
The post-move recursive snapshot comparison was also empty with exit status `0`.
The active source directory no longer exists. The archive contains the proposal,
delta specification, design, tasks, apply-progress, and verify-report. This
archive report is additive audit metadata and was not in the pre-move snapshot,
so it is excluded from the byte-identity comparison.

Verbatim mechanical readback results:

```text
NEW_SPEC_DIFF_STATUS=0
SPEC_POST_DIFF_STATUS=0
GIT_MV_STATUS=128
FALLBACK_SOURCE_DIFF_STATUS=0
PLAIN_MV_STATUS=0
POST_MOVE_DIFF_STATUS=0
MAIN_SPEC_DIFF_STATUS=0
ACTIVE_SOURCE_EXISTS=0
```

No earlier archive under `openspec/changes/archive/` was modified. No source,
test, build, commit, push, pull request, attempt acquire/settle, or
receipt-driven review operation was performed by this archive phase.

## Scope and Delivery Boundaries

Only backend-score stage 4 was archived. The synced `backend-score` main
specification is now the source of truth for the protected deterministic score
capability; the dated archive preserves the complete stage audit trail. The
parent orchestrator owns the authorized conventional stage commit. Stage 5 is
autonomous and parent-authorized after this archive; it is outside this change
and must not mutate this archived audit trail.

## Result

The hybrid archive is complete. The backend-score change is fully planned,
implemented, independently verified, and archived. No further SDD phase is
recommended for this change.
