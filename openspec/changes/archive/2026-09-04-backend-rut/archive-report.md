# Archive Report: backend-rut

**Schema**: `gentle-ai.sdd-archive/v1`
**Change**: `backend-rut`
**Archived**: `2026-09-04`
**Artifact store**: hybrid
**Final status**: complete

## Final State

The backend-rut stage 2 change is archived after native SDD status reported
`dependencies.archive: ready`, `nextRecommended: archive`, and no blocked
reasons. Native verification settlement was complete. The final verification
evidence revision is
`sha256:851f056290ecd0bf72c2222f57787046bbafa27c4ee1c4e6c8767339cae8c548`.

Final evidence covers all `6/6` implementation tasks, `4/4` requirements, and
`7/7` scenarios. Fourteen tests passed: six RUT unit tests and eight existing
backend foundation tests. Backend build and type checking passed. No CRITICAL
findings or blockers remain. Coverage tooling is unavailable per project
configuration.

The verifier also ran root build/typecheck commands that touched ignored
frontend build output. No tracked frontend files changed, and this archive
makes no frontend test-coverage claim. No source changes, test changes,
commits, pushes, or pull requests were made by the archive phase.

## Artifacts Read

| Artifact | Filesystem locator | Engram observation |
|---|---|---:|
| Proposal | `openspec/changes/backend-rut/proposal.md` | `#25` |
| Delta specification | `openspec/changes/backend-rut/specs/rut-validation/spec.md` | `#27` |
| Design | `openspec/changes/backend-rut/design.md` | `#28` |
| Tasks | `openspec/changes/backend-rut/tasks.md` | `#32` |
| Apply progress | `openspec/changes/backend-rut/apply-progress.md` | filesystem read |
| Verify report | `openspec/changes/backend-rut/verify-report.md` | `#37` |

All six persisted implementation tasks were checked before archive; no stale
unchecked task remains.

## Spec Sync

The delta specification was mechanically copied to the new main specification
because no prior main spec existed:

- `openspec/specs/rut-validation/spec.md` — created from
  `openspec/changes/backend-rut/specs/rut-validation/spec.md`
- Pre-copy `diff -r` output: empty; exit status `0`
- Post-archive delta-to-main `diff -r` output: empty; exit status `0`

## Archive Move

The active change tree was moved to:

`openspec/changes/archive/2026-09-04-backend-rut/`

`git mv` was attempted and returned status `128` because the untracked
OpenSpec source tree had no tracked source for Git to move (`fatal: source
directory is empty`). A pre-move recursive snapshot was compared with the
source before the permitted plain `mv` fallback; that `diff -r` was empty with
exit status `0`. The post-move recursive snapshot comparison was also empty
with exit status `0`. The active source directory no longer exists. The
archive contains the proposal, delta spec, design, tasks, apply-progress,
verify-report, and this additive archive report. The archive report was not in
the pre-move snapshot and is therefore excluded from byte-identity comparison.

## Scope and Delivery Boundaries

Only backend-rut stage 2 was archived. No frontend or application-scope
changes were introduced by archive. User-owned configuration changes were
preserved. No commits, pushes, pull requests, or receipt-driven review
activation were performed.

## Result

The hybrid archive is complete. The synced main specification is the source of
truth for `rut-validation`; the dated archive preserves the complete stage
audit trail. No further SDD phase is recommended for this change.
