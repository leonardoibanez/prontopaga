# Archive Report: backend-foundation

**Schema**: `gentle-ai.sdd-archive/v1`
**Change**: `backend-foundation`
**Archived**: `2026-09-04`
**Artifact store**: hybrid
**Final status**: complete

## Final State

The backend-foundation stage 1 change is archived after native SDD status reported `dependencies.archive: ready`, `nextRecommended: archive`, and no blocked reasons. Native verification settlement was complete. The final verification evidence revision is `sha256:d9f61abae53e888a1233e885622db7fcc59df3159bbc6a30c4f389e35366176a`; the persisted verify-report hash is `sha256:ff99c451734614940ff2832d3ce771e4aea6f4df1e5cba33bfbf3fb255aee79c` and matches Engram observation `#21`.

Final evidence covers all `6/6` implementation tasks, `4/4` requirements, and `6/6` scenarios. Eight persistent node:test cases passed, plus independent real `dist/main.js` production-entrypoint probes for configured and default ports, health, prefix enforcement, CORS, preflight, SIGTERM shutdown, and port cleanup. Backend build and type checking passed. No CRITICAL findings or blockers remain. Coverage and lint remain unavailable per project configuration.

The historical Strict TDD warning is retained: RED evidence was the expected missing compiled bootstrap module before behavioral assertions ran. It is not hidden or reclassified; subsequent GREEN and independent runtime evidence passed without production changes.

## Artifacts Read

| Artifact | Filesystem locator | Engram observation |
|---|---|---:|
| Project initialization | `openspec/config.yaml` | `#8` (`sdd-init/prontopaga`)
| Proposal | `openspec/changes/backend-foundation/proposal.md` | `#10`
| Delta specification | `openspec/changes/backend-foundation/specs/backend-bootstrap/spec.md` | `#11`
| Design | `openspec/changes/backend-foundation/design.md` | `#13`
| Tasks | `openspec/changes/backend-foundation/tasks.md` | `#15`
| Apply progress | `openspec/changes/backend-foundation/apply-progress.md` | `#19`
| Verify report | `openspec/changes/backend-foundation/verify-report.md` | `#21`

All six persisted implementation tasks were checked before archive; no stale unchecked task remains.

## Spec Sync

The delta specification was mechanically copied to the new main specification because no prior main spec existed:

- `openspec/specs/backend-bootstrap/spec.md` — created from `openspec/changes/backend-foundation/specs/backend-bootstrap/spec.md`
- Pre-copy `diff -r` output: empty; exit status `0`

## Archive Move

The active change tree was moved to:

`openspec/changes/archive/2026-09-04-backend-foundation/`

`git mv` was attempted and returned status `128` because the untracked OpenSpec source tree had no tracked source for Git to move. A pre-move recursive snapshot was compared with the source before the permitted plain `mv` fallback; that `diff -r` was empty with exit status `0`. The post-move recursive snapshot comparison was also empty with exit status `0`. The active source directory no longer exists. The archive contains the proposal, delta spec, design, tasks, apply-progress, verify-report, and instance metadata; this report is additive audit metadata and excluded from the pre-move byte-identity comparison.

## Scope and Delivery Boundaries

Only backend-foundation stage 1 was archived. The next backend-rut stage was not started. No frontend or application-scope changes were introduced by archive, and user-owned `.gitignore` and `docs/` changes were preserved. No commits, pushes, pull requests, or receipt-driven review activation were performed.

## Result

The hybrid archive is complete. The synced main specification is the source of truth for `backend-bootstrap`; the dated archive preserves the complete stage audit trail. No further SDD phase is recommended for this change.
