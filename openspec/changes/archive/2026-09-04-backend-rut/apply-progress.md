# Apply Progress: Backend RUT Utility

**Change**: backend-rut
**Mode**: Strict TDD
**Work unit**: `rut-utility`
**Previous apply progress**: none

## Completed Tasks

- [x] 1.1 Create behavioral `node:test` coverage for supported RUT forms, strict rejection, transforms, checksums, deterministic behavior, and non-string inputs.
- [x] 1.2 Create compilable exported `null`/`false` RUT stubs and capture behavioral assertion RED evidence before domain logic.
- [x] 2.1 Implement exact full-string parsing for compact, hyphenated, and correctly grouped dotted forms.
- [x] 2.2 Implement normalization, canonical formatting, modulo-11 check-digit calculation, and checksum validation.
- [x] 3.1 Extract a formatting helper while retaining public contracts and behavioral assertions.
- [x] 3.2 Run the root test command and confirm only the pure utility and unit test were added.

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 1.1 | `backend/test/rut.test.cjs` | Unit | N/A (new file) | Written before production module | Covered six behavioral groups | Supported forms, malformed inputs, transforms, numeric/0/K checksums, validity, determinism | Table-driven loops keep equivalent assertions concise |
| 1.2 | `backend/test/rut.test.cjs` | Unit | N/A (new module) | `PATH="/tmp/node-v24.20.0-darwin-arm64/bin:$PATH" npm test` exited 1: 10 passed, 4 expected-value assertions failed against `null`/`false` stubs | Stub build compiled; domain logic deferred until captured RED | Four independent behavioral failures proved stubs could not satisfy contract | Replaced only after RED with minimal pure behavior |
| 2.1 | `backend/test/rut.test.cjs` | Unit | N/A (new module) | Existing parser assertions failed against stub | Root command passed after exact-match parser | Compact, hyphenated, dotted, lowercase K, malformed and whitespace cases | Shared `exactMatch` prevents final-newline acceptance |
| 2.2 | `backend/test/rut.test.cjs` | Unit | N/A (new module) | Transform/checksum/validation assertions failed against stubs | Root command passed after pure transformations and modulo-11 implementation | Numeric `5`, `0`, and `K` outcomes plus invalid supplied digits | Named `formatRutBody` helper retained green behavior |
| 3.1 | `backend/test/rut.test.cjs` | Unit | N/A (new files) | Behavioral tests already present before code | Root command passed after helper extraction | All six RUT test groups execute production functions | Extracted canonical body formatter; no contract change |
| 3.2 | `backend/test/rut.test.cjs` | Unit | N/A (new files) | N/A — evidence task | Root command exited 0: 14 passed, 0 failed | Eight foundation and six RUT tests run together | No formatter is configured or run |

## Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused test command and exact result | `PATH="/tmp/node-v24.20.0-darwin-arm64/bin:$PATH" npm test` — exit 0; 14 tests total, 14 passed, 0 failed; includes 6 RUT unit tests and 8 existing foundation tests. |
| RED command and exact result | Same command before domain logic — `npm` exited 1; 14 tests total, 10 passed, 4 expected-value RUT assertion failures; compilation and exports succeeded. |
| Runtime harness command/scenario and exact result | N/A — this work unit is a pure utility with no HTTP, process, persistence, external, or application-runtime boundary. |
| Rollback boundary | Remove `backend/src/rut/rut.ts` and `backend/test/rut.test.cjs`; no endpoint, Nest wiring, persistence, dependency, or frontend contract changes. |

## Scope Confirmation

- Changed source and test paths are limited to `backend/src/rut/rut.ts` and `backend/test/rut.test.cjs`.
- No endpoint, Nest wiring, persistence, dependency, frontend, commit, push, or PR was created.
- No source-mutating formatter ran after the final GREEN test command.

## Status

6/6 assigned tasks complete. Ready for independent SDD verification.
