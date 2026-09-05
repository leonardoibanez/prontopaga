# Tasks: Backend RUT Utility

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines (total) | ~210 (implementation ~90; tests ~120) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single cohesive stage-2 work unit |
| Delivery strategy | ask-on-risk |
| Chain strategy | none (not applicable; no chained PRs) |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: none (not applicable)
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Pure RUT parsing, transforms, checksum validation, and behavioral coverage | Single PR | `npm test` | N/A — pure utility has no HTTP, process, or external runtime boundary | Remove `backend/src/rut/rut.ts` and `backend/test/rut.test.cjs`; no unrelated contracts or dependencies change |

## Phase 1: RED — Behavioral Contracts and Compilable Stubs

- [x] 1.1 Create `backend/test/rut.test.cjs` with expected-value `node:test` assertions for all supported forms, strict malformed-input rejection, normalization/formatting, numeric and `K` checksums, known valid/invalid examples, deterministic repeated calls, and non-string inputs.
- [x] 1.2 Create `backend/src/rut/rut.ts` with the specified exported types/functions as compilable `null`/`false` stubs only; run `npm test` and record behavioral assertion failures (not missing-module, compile, or export errors) before adding domain logic.

## Phase 2: GREEN — Pure RUT Behavior

- [x] 2.1 Implement exact runtime-type and full-string parsing for compact, plain-hyphen, and correctly grouped dotted-hyphen forms; preserve the body string and uppercase `k` in `backend/src/rut/rut.ts`.
- [x] 2.2 Implement normalization, right-grouped canonical formatting, modulo-11 calculation with `0`/`K` mappings, and checksum comparison in `backend/src/rut/rut.ts`; keep operations pure and dependency-free until `npm test` passes.

## Phase 3: REFACTOR — Stage Evidence

- [x] 3.1 Refactor `backend/test/rut.test.cjs` tables/helpers and `backend/src/rut/rut.ts` internals without changing the public contracts; retain explicit expected-value assertions and all specification scenarios.
- [x] 3.2 Run `npm test` from the workspace root and record the RUT suite plus all eight foundation tests; confirm no endpoint, Nest wiring, persistence, dependency, or frontend files changed.

Threat-matrix cases are N/A per design; no routing, shell, subprocess, VCS/PR automation, executable-file, or process-integration tasks apply.
