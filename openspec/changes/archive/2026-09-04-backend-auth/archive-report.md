# Archive Report: backend-auth

**Schema**: `gentle-ai.sdd-archive/v1`
**Change**: `backend-auth`
**Archived**: `2026-09-04`
**Artifact store**: hybrid
**Final status**: complete

## Final State

The backend-auth stage 3 change is archived after native SDD status reported
`dependencies.archive: ready`, `nextRecommended: archive`, and no blocked
reasons. Native verification settlement was complete. The final verification
evidence revision is
`sha256:42184582f25004caba290be264ad6bda0c53a04bd6681d85cc077b9155127a35`.
The archived verify report has SHA-256
`sha256:fc94887ea921f01d46de1f98a2d3175abe2d75687bab414161405c48a545840a`.

Final evidence covers all `10/10` implementation tasks, `6/6` requirements,
and `13/13` scenarios. The current verification pass records `25` tests passed,
with backend build and type checking passed; no CRITICAL findings or blockers
remain. Coverage tooling is unavailable per project configuration.

The initial failed verification evidence remains preserved in
`apply-progress.md` as historical remediation context. Its original `24-test`
snapshot is not the final state: the signed dotted-RUT claim finding was fixed
by requiring exact canonical catalog equality, and the regression now passes
within the current `25-test` verification. The stale README scope sentence was
also corrected. The current pass and its evidence revision outrank the earlier
snapshot under the archive final-state hierarchy.

No source, test, build, commit, push, pull request, or receipt-driven review
operation was performed by the archive phase.

## Artifacts Read

| Artifact | Filesystem locator | Engram observation |
|---|---|---:|
| Proposal | `openspec/changes/backend-auth/proposal.md` | `#40` |
| Authentication specification | `openspec/changes/backend-auth/specs/backend-authentication/spec.md` | `#41` |
| Bootstrap delta specification | `openspec/changes/backend-auth/specs/backend-bootstrap/spec.md` | filesystem read |
| Design | `openspec/changes/backend-auth/design.md` | `#42` |
| Tasks | `openspec/changes/backend-auth/tasks.md` | `#44` |
| Apply progress | `openspec/changes/backend-auth/apply-progress.md` | filesystem read |
| Verify report | `openspec/changes/backend-auth/verify-report.md` | `#49` |

All ten persisted implementation tasks were checked before archive; no stale
unchecked task remains.

## Spec Sync

The new authentication specification was mechanically copied in full because
no prior main spec existed:

- `openspec/specs/backend-authentication/spec.md` — created from
  `openspec/changes/backend-auth/specs/backend-authentication/spec.md`
- Pre-copy `diff -r` output: empty; exit status `0`
- Post-archive delta-to-main `diff -r` output: empty; exit status `0`

The existing bootstrap main specification was merged rather than replaced:

- `openspec/specs/backend-bootstrap/spec.md` — modified requirements
  `Shared bootstrap parity` and `Health endpoint compatibility`
- Unrelated requirements `Environment and CORS defaults` and
  `Deterministic lifecycle and teardown` were preserved byte-for-byte.

## Archive Move

The active change tree was moved to:

`openspec/changes/archive/2026-09-04-backend-auth/`

`git mv` was attempted and returned status `128` because the untracked
OpenSpec source tree had no tracked source for Git to move (`fatal: source
directory is empty`). A pre-move recursive snapshot was compared with the
source before the permitted plain `mv` fallback; that `diff -r` was empty with
exit status `0`. The post-move recursive snapshot comparison was also empty
with exit status `0`. The active source directory no longer exists. The
archive contains proposal, both delta specs, design, tasks, apply-progress,
verify-report, and this additive archive report. The archive report was not in
the pre-move snapshot and is therefore excluded from byte-identity comparison.

Verbatim mechanical readback results:

```text
NEW_SPEC_DIFF_STATUS=0
FALLBACK_SOURCE_DIFF_STATUS=0
POST_MOVE_DIFF_STATUS=0
AUTH_SPEC_DIFF_STATUS=0
```

## Scope and Delivery Boundaries

Only backend-auth stage 3 was archived. Frontend work and unrelated product
routes remain outside scope. User-owned configuration and documentation changes
were preserved. The parent orchestrator owns the authorized post-archive
conventional commit; no commit or delivery operation was performed here.

## Result

The hybrid archive is complete. The synced main specifications are the source
of truth for `backend-authentication` and the modified `backend-bootstrap`; the
dated archive preserves the complete stage audit trail. No further SDD phase is
recommended for this change.
