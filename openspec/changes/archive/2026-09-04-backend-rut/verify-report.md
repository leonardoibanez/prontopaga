```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:851f056290ecd0bf72c2222f57787046bbafa27c4ee1c4e6c8767339cae8c548
verdict: pass
blockers: 0
critical_findings: 0
requirements: 4/4
scenarios: 7/7
test_command: npm test
test_exit_code: 0
test_output_hash: sha256:56ebf3ba3ef7b69b0e87198c398d120dcd553d9498501a167faabbf3ed1c01bd
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:0ed9b437531e16b7b0a8a6aa24a23dfc27d0e0e7fb4d67e51a0541188672e883
```

## Verification Report

**Change**: backend-rut
**Version**: N/A
**Mode**: Strict TDD

### Completeness
| Metric | Value |
|---|---:|
| Tasks total | 6 |
| Tasks complete | 6 |
| Tasks incomplete | 0 |
| Requirements complete | 4/4 |
| Scenarios compliant | 7/7 |

### Build & Tests Execution

**Build**: ✅ Passed

```text
PATH=/tmp/node-v24.20.0-darwin-arm64/bin:$PATH npm run build
Exit 0. Backend Nest build and frontend Next.js production build completed successfully.
Output hash: sha256:0ed9b437531e16b7b0a8a6aa24a23dfc27d0e0e7fb4d67e51a0541188672e883
```

**Tests**: ✅ 14 passed, 0 failed, 0 skipped

```text
PATH=/tmp/node-v24.20.0-darwin-arm64/bin:$PATH npm test
Exit 0. Six RUT unit tests and eight existing backend foundation tests passed.
Output hash: sha256:56ebf3ba3ef7b69b0e87198c398d120dcd553d9498501a167faabbf3ed1c01bd
```

**Type check**: ✅ Passed

```text
PATH=/tmp/node-v24.20.0-darwin-arm64/bin:$PATH npm run typecheck
Exit 0. Backend tsc --noEmit and frontend type generation/type checking passed.
Output hash: sha256:67f89ed67378d6b9aa82cca296e1f4087ab60296153f7157691176c2c24b0b7a
```

**Coverage**: ➖ Not available — no coverage tool or configured coverage command was detected.

### Spec Compliance Matrix
| Requirement | Scenario | Runtime test evidence | Result |
|---|---|---|---|
| Strictly parse supported RUT forms | Accept each supported representation | `backend/test/rut.test.cjs:11-18` — supported compact, plain-hyphen, and dotted inputs produce the same parsed fields | ✅ COMPLIANT |
| Strictly parse supported RUT forms | Reject whitespace and malformed structure | `backend/test/rut.test.cjs:20-37` — whitespace, malformed groups, leading zero, overlong body, punctuation, and non-strings return `null` | ✅ COMPLIANT |
| Normalize and format canonically | Normalize case and punctuation | `backend/test/rut.test.cjs:39-46` — lowercase `k`, normalization, and dotted canonical output use uppercase `K` | ✅ COMPLIANT |
| Normalize and format canonically | Preserve significant leading digits | `backend/test/rut.test.cjs:43` — `6-K` remains `6-K` | ✅ COMPLIANT |
| Verify modulo-11 checksums | Accept numeric and K checksums | `backend/test/rut.test.cjs:48-55,57-65` — numeric `5`, `0`, and `K` calculations and valid values pass | ✅ COMPLIANT |
| Verify modulo-11 checksums | Reject an incorrect checksum | `backend/test/rut.test.cjs:62-64` — `12.345.678-9` returns `false` | ✅ COMPLIANT |
| Remain pure and registry-independent | Same input has deterministic results | `backend/test/rut.test.cjs:67-73` — repeated results match and object coercion is rejected; source inspection confirms no imports, I/O, framework wiring, external lookup, or mutable global state | ✅ COMPLIANT |

**Compliance summary**: 7/7 scenarios compliant.

### Correctness (Static Evidence)
| Requirement | Status | Notes |
|---|---|---|
| Strictly parse supported RUT forms | ✅ Implemented | Separate exact-match patterns accept only the three specified forms; runtime type, body length, leading-zero, grouping, character, whitespace, and full-length checks are enforced. |
| Normalize and format canonically | ✅ Implemented | Parsed bodies retain significant digits; normalization emits `BODY-DV`; formatting groups from the right and uppercases `K`. |
| Verify modulo-11 checksums | ✅ Implemented | Right-to-left weights cycle through 2–7; candidates 11 and 10 map to `0` and `K`; validation compares the supplied digit. |
| Remain pure and registry-independent | ✅ Implemented | The module contains pure functions and immutable result objects with no NestJS, I/O, persistence, network, dependency, or mutable-global boundary. |

### Coherence (Design)
| Decision | Followed? | Notes |
|---|---|---|
| Runtime-safe public API | ✅ Yes | Public functions accept `unknown`; failures return `null` or `false` as designed. |
| Syntax before checksum | ✅ Yes | `parseRut` checks structure only and `isValidRut` performs checksum comparison. |
| Strict form recognition | ✅ Yes | Dedicated anchored patterns plus complete-match comparison reject malformed and newline-suffixed input. |
| String representation | ✅ Yes | Body remains a string and check digit is normalized to the declared union. |
| No framework abstraction | ✅ Yes | No provider, controller, module registration, or new dependency was introduced. |
| Scope and rollback boundary | ✅ Yes | Implementation scope is limited to the new utility and unit-test files; no application wiring or external boundary exists. |

### TDD Compliance
| Check | Result | Details |
|---|---|---|
| TDD evidence reported | ✅ | The full apply-progress artifact contains task-level RED, GREEN, triangulation, safety-net, and refactor evidence. |
| All tasks have tests/evidence | ✅ | 6/6 tasks reference the RUT test file or the final evidence run. |
| RED confirmed | ✅ | The test file exists; apply evidence records a compilable-stub RED run with 10 passing and 4 expected-value assertion failures before domain logic. |
| GREEN confirmed | ✅ | The current root test command passes 14/14 tests, including all six RUT tests. |
| Triangulation adequate | ✅ | Six behavioral tests exercise supported forms, invalid forms, transformations, three checksum outcome classes, validity, determinism, and runtime-type rejection. |
| Safety net for modified files | ✅ | The source module and test file are both new; `git status --short` confirms they are untracked rather than modifications to existing files. |

**TDD Compliance**: 6/6 checks passed.

### Test Layer Distribution
| Layer | Tests | Files | Tools |
|---|---:|---:|---|
| Unit | 6 | 1 | Node.js `node:test` |
| Integration | 0 | 0 | Not applicable to this pure utility |
| E2E | 0 | 0 | Not applicable to this pure utility |
| **Total** | **6** | **1** | |

The repository test run additionally passed eight pre-existing backend foundation tests. A runtime harness is not applicable because this change exposes no HTTP, process, persistence, application-runtime, or external-service boundary.

### Changed File Coverage

Coverage analysis skipped — no coverage tool detected.

### Assertion Quality

**Assertion quality**: ✅ All assertions invoke production functions and verify concrete behavior. Table-driven loops use non-empty literal case sets; no tautologies, orphan empty checks, type-only assertions, smoke-only assertions, implementation-detail coupling, mocks, or ghost loops were found.

### Quality Metrics

**Linter**: ➖ Not applicable — the configured root linter targets the frontend only, outside the changed files.  
**Type Checker**: ✅ No errors; root `npm run typecheck` exited 0.

### Issues Found

**CRITICAL**: None.  
**WARNING**: None.  
**SUGGESTION**: None.

### Verification Boundaries

- Verification covers the four requirements and seven scenarios in the retrieved specification.
- Syntax/checksum validity does not establish SII registration or legal identity.
- No runtime harness was run because the verified capability is a pure, currently unwired utility.
- No production source file was modified during verification.

### Verdict

PASS

All 6 tasks are complete, all 4 requirements and 7 scenarios have passing runtime coverage, and test, build, and type-check commands exit successfully.
