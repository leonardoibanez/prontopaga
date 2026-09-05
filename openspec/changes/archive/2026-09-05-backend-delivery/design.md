# Design: Complete Backend Delivery Evidence

## Technical Approach

Deliver a documentation-only path unless the bounded review proves a runtime defect. `README.md` will lead with a root-directory quickstart and link to Spanish `docs/backend-delivery.md`, the single detailed source for HTTP examples, credentials, security evidence, test traceability, limitations, and AI use. This maps five requirements and six scenarios without three-way duplication.

## Architecture Decisions

| Decision | Choice | Alternative / tradeoff | Rationale |
|---|---|---|---|
| Dependency install | From root, use `npm ci --workspace backend --include-workspace-root`; mention root `npm ci` only for intentional frontend setup | Root `npm ci` is simpler but installs deferred frontend dependencies | npm 11 supports both flags and the scoped command preserves backend-only setup. |
| Documentation split | Concise `README.md` quickstart plus detailed `docs/backend-delivery.md` | One large README is easier to discover but harder to scan and maintain | Progressive disclosure keeps the happy path visible and one authoritative detailed contract. |
| Runtime evidence | Replay commands and curls in an untracked temporary workspace; add no harness | A script is repeatable but creates an unsupported surface | The delivery needs evidence, not runtime code or dependencies. |
| Defect handling | Record demonstrated findings only; code remains unchanged unless a behavioral RED test proves a defect | Speculative hardening appears proactive but expands scope without evidence | Strict TDD applies to code fixes; documentation readback is not mislabeled as RED. |

## Data Flow

```text
README quickstart -> detailed guide -> temporary backend process
                                      -> /api/health
synthetic login -> token shell variable -> /score/:rut -> redacted evidence
existing node:test names -----------------------------> evidence matrix
```

The quickstart generates `JWT_SECRET` with `node:crypto.randomBytes(32).toString('hex')`, exports it for the shell, builds, then runs `npm run start -w backend`. No live secret is written.

## File Changes

| File | Action | Description |
|---|---|---|
| `README.md` | Modify | Spanish backend-only quickstart, scope, and link to the detailed guide. |
| `docs/backend-delivery.md` | Create | Routes, curls, synthetic credentials, evidence matrix, review, caveats, and AI declaration. |

`backend/src/` and `backend/test/` are review-only. A proven defect must identify exact files before tasks change and begin with a failing behavioral test. The PDF, `.gitignore`, frontend, and real environment files remain untouched.

## Interfaces / Contracts

The guide preserves `/api/health`, root `POST /login`, and protected root `GET /score/:rut`. It documents `200`, generic `401`, owner-or-admin `403`, authenticated invalid-RUT `400`, `Cache-Control: no-store`, and UTC ISO `fecha`. Tokens are captured into an ephemeral shell variable and never printed in evidence. Demo passwords appear only in the clearly labeled intentional synthetic-credentials table, not logs.

The PDF sample `12.345.678-9` is invalid; curls use `12.345.678-5`. Values `87`, `33`, and `83` are deterministic SHA-256 synthetic outputs, never risk judgments, unique IDs, or collision guarantees. The AI declaration names Codex/OpenAI models and gentle-ai/Engram, attributes assistance on backend modules, tests, and documentation, and does not claim human review.

## Testing Strategy

| Layer | What to verify | Approach |
|---|---|---|
| Structural | Commands, routes, credentials, test names, preservation | Read back both Markdown files; compare matrix names with `backend/test/*.test.cjs` and inspect `git diff`. |
| Regression | Existing backend behavior | From root record exit status for exactly: `npm run build -w backend`, `npm run typecheck -w backend`, `npm test -w backend`, `npm test`. |
| Operational | Fresh config and HTTP outcomes | Copy only tracked root manifests and backend files to `mktemp -d`; install scoped dependencies; start the built production child under `env -i` with only required `PATH`, `HOME`, generated secret, and port. Exercise exact curls while retaining the token only in memory. Terminate the captured PID with `kill -TERM "$PID"`, `wait`, then remove the temporary workspace. Record statuses and redacted response fields only. |

The focused read-only review covers bootstrap errors, auth/score HTTP responses, application logs, synthetic fixtures, `.env.example`, `.gitignore`, and tracked files. Its report separates findings from unreviewed risks; it is not a broad security audit.

## Threat Matrix

| Boundary | Applicability | Design response | Planned RED tests |
|---|---|---|---|
| Documentation-like paths | N/A — no path classifier or arbitrary file execution | Commands use fixed repository paths | None |
| Git repository selection | N/A — no configurable `git -C` or repository selector | Every command states repository-root cwd | None |
| Commit state | N/A — the guide does not automate commits | Ordinary delivery policy remains external | None |
| Push state | N/A — no push automation | Push is out of scope | None |
| PR commands | N/A — no PR automation or command composition | PR creation is out of scope | None |

## Migration / Rollout

No migration required. Roll back the documentation commit; there is no persistent or external state.

## Open Questions

None.
