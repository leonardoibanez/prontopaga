```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:42184582f25004caba290be264ad6bda0c53a04bd6681d85cc077b9155127a35
verdict: pass
blockers: 0
critical_findings: 0
requirements: 6/6
scenarios: 13/13
test_command: 'PATH=/tmp/node-v24.20.0-darwin-arm64/bin:$PATH npm test'
test_exit_code: 0
test_output_hash: sha256:7a63a804a3ce0af1de6f2187178ce83ef4cf7a83cd825f7047d835d1e3e0be2b
build_command: 'PATH=/tmp/node-v24.20.0-darwin-arm64/bin:$PATH npm run build -w backend'
build_exit_code: 0
build_output_hash: sha256:017a6a91cbab5e2cc77a20f2093d3df2b964921561dfd398b7c237c94e40d7fe
```

## Verification Report

**Change**: `backend-auth`
**Version**: N/A
**Mode**: Strict TDD bounded remediation verification
**Remediates evidence**: `sha256:1bfb600d8f6465d2d7deae4a4d0c71fc98f17f1e0126f33d0d934e080d235493`

### Completeness
| Metric | Value |
|---|---:|
| Tasks total | 10 |
| Tasks complete | 10 |
| Tasks incomplete | 0 |
| Requirements compliant | 6/6 |
| Scenarios compliant | 13/13 |

### Build & Tests Execution

**Tests**: ✅ 25 passed, 0 failed, 0 skipped.

```text
PATH=/tmp/node-v24.20.0-darwin-arm64/bin:$PATH npm test
exit 0; node:test: 25 passed, 0 failed, 0 skipped
output sha256:7a63a804a3ce0af1de6f2187178ce83ef4cf7a83cd825f7047d835d1e3e0be2b
```

**Build**: ✅ Passed.

```text
PATH=/tmp/node-v24.20.0-darwin-arm64/bin:$PATH npm run build -w backend
exit 0
output sha256:017a6a91cbab5e2cc77a20f2093d3df2b964921561dfd398b7c237c94e40d7fe
```

**Type check**: ✅ Passed.

```text
PATH=/tmp/node-v24.20.0-darwin-arm64/bin:$PATH npm run typecheck -w backend
exit 0
output sha256:9e740f88053be81bd013f40e4e863c37e7287ba648a790a2fa548ae31e280c5d
```

**Whitespace check**: ✅ `git diff --check` exited 0; empty output hash `sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.

**Coverage**: ➖ Not available; no coverage command or threshold is configured.

### Bounded Remediation Evidence

The updated apply record preserves all 10 completed tasks and documents the corrective behavioral cycle. Before the fix, 24 tests passed. The new signed dotted-RUT regression test then produced RED: `npm test` exited 1 with `Missing expected exception`. After changing the guard from normalize-before-compare to exact canonical catalog equality, GREEN passed 25/25. The stale README scope sentence was also corrected.

### Independent Runtime Evidence

A fresh application-resolved claim probe independently confirmed:

- compact catalog RUT `12345678-5` is accepted and reconstructs the catalog principal;
- dotted RUT `12.345.678-5` is rejected with `401`;
- future `iat`, 901-second lifetime, missing `exp`, and administrator `rut` are rejected with `401`;
- an arbitrary extra login field is rejected with `400`.

```text
claim probe source sha256:b7a4f3b97c61e1c93009b358599e59c53c3e0026cc0ea7644b8b1049882fec8c
claim probe output sha256:36ba7003e5684e9af932c9c6acbe4678df157706a5f68b66e8746407c762b1a9
exit 0; temporary source removed
```

A separate temporary harness launched compiled `backend/dist/main.js` with a verification-only secret and owned ephemeral port. It observed `GET /api/health` → `200`, `POST /login` → `200`, `token_type: Bearer`, and `expires_in: 900`. It sent `SIGTERM` to exact child PID `19371`, observed signal termination, confirmed the secret was absent from logs, and removed its temporary source.

```text
production probe source sha256:64a84e658eea95f21b04e15357319d698a5a3b54683fb25e8f3b3ac83679cc7f
production probe output sha256:3ed8ee27501aca7b14ef3240f5c86103884fb643a69474a1f2dbf1e496e68baa
exit 0; exact PID cleaned; temporary source removed; no persistent source changes
```

### Spec Compliance Matrix
| Requirement | Scenario | Runtime/static evidence | Result |
|---|---|---|---|
| Strict login contract | Valid login returns the bearer contract | Full suite and compiled-main probe verify `200`, Bearer token, and 900 seconds | ✅ COMPLIANT |
| Strict login contract | Client identity fields are rejected | Role/RUT cases plus independent arbitrary-field probe return `400` | ✅ COMPLIANT |
| Strict login contract | Malformed credentials are rejected | Missing, non-object, malformed JSON, wrong types, and oversized cases pass | ✅ COMPLIANT |
| Server-owned synthetic identities | Invalid credentials are indistinguishable | Unknown-user and wrong-password responses are identical generic `401` | ✅ COMPLIANT |
| Server-owned synthetic identities | Identity attributes come from the server | All three identities issue server-derived role/RUT claims | ✅ COMPLIANT |
| Strict HS256 token issuance | Claims match server identity and lifetime | HS256 header, catalog claims, integer time claims, and 900-second lifetime pass | ✅ COMPLIANT |
| Strict HS256 token issuance | Missing signing secret is fail-closed | Config checks and compiled no-secret child exit 1 pass | ✅ COMPLIANT |
| Reusable bearer verification | Valid bearer token is accepted | Existing test and fresh compact-RUT probe reconstruct verified principals | ✅ COMPLIANT |
| Reusable bearer verification | Invalid bearer tokens are denied uniformly | Full threat suite plus fresh dotted/time/claim probes return `401` | ✅ COMPLIANT |
| Shared bootstrap parity | Production and test share effective authentication configuration | Tests and real compiled entrypoint use the shared construction path | ✅ COMPLIANT |
| Shared bootstrap parity | Existing shared settings remain consistent | Prefix, CORS, shutdown, and authentication configuration pass | ✅ COMPLIANT |
| Health endpoint compatibility | Health request succeeds | Test suite and compiled-main probe return specified health response | ✅ COMPLIANT |
| Health endpoint compatibility | Prefix remains enforced | `/health` remains `404`; `/api/health` remains `200` | ✅ COMPLIANT |

**Compliance summary**: 13/13 scenarios compliant.

### Correctness (Static Evidence)
| Requirement | Status | Notes |
|---|---|---|
| Strict login contract | ✅ Implemented | DTO and shared validation/body boundary reject malformed, coerced, extra, and oversized input. |
| Server-owned synthetic identities | ✅ Implemented | Exactly one admin and two users are frozen server records. |
| Strict HS256 token issuance | ✅ Implemented | Required secret, HS256, exact lifetime, and server-derived claims are explicit. |
| Reusable bearer verification | ✅ Implemented | Algorithm, time, subject, role, exact canonical RUT, and catalog binding are enforced before principal reconstruction. |
| Shared bootstrap parity | ✅ Implemented | Production and HTTP tests share `parseBootstrapConfig` and `createApplication`. |
| Health endpoint compatibility | ✅ Implemented | Existing prefixed health contract remains available. |

No score or other protected product route was found. `git diff -- frontend` is empty. The `frontend` workspace stanza in `package-lock.json` remains byte-equivalent to `HEAD`; shared lockfile additions belong to the backend authentication dependency closure.

### Coherence (Design)
| Decision | Followed? | Notes |
|---|---|---|
| Required injected JWT configuration | ✅ Yes | Missing and blank secrets fail closed without fallback. |
| Literal method-scoped `/login` | ✅ Yes | `/api/login` remains absent while `/api/health` remains prefixed. |
| Strict DTO/body boundary | ✅ Yes | Runtime probes cover known and arbitrary extra fields. |
| Exactly three synthetic identities | ✅ Yes | Catalog matches the approved records. |
| HS256 and catalog-bound reconstruction | ✅ Yes | Exact canonical RUT representation is now required. |
| No product authorization route | ✅ Yes | No score/product route was added. |

### TDD Compliance
| Check | Result | Details |
|---|---|---|
| TDD evidence reported | ✅ | Original evidence covers all 10 tasks and corrective evidence records the bounded RED/GREEN cycle. |
| All tasks have tests | ✅ | 10/10 tasks map to existing auth or health test files. |
| RED confirmed | ✅ | Corrective test was added first and failed with `Missing expected exception`. |
| GREEN confirmed | ✅ | Independent full-suite execution passed 25/25. |
| Triangulation adequate | ✅ | Compact and dotted forms now exercise opposite outcomes through the same application-resolved guard. |
| Safety net for modified files | ✅ | 24/24 passed before correction and 25/25 passed after it. |

**TDD Compliance**: 6/6 checks passed.

### Test Layer Distribution
| Layer | Tests | Files | Tools |
|---|---:|---:|---|
| Unit | 4 | 1 | `node:test` |
| Integration | 15 | 2 | `node:test`, Nest application HTTP/runtime |
| E2E | 0 | 0 | Not configured |
| **Change-related total** | **19** | **2** | |

The repository suite also contains six unchanged RUT unit tests, yielding 25 tests total.

### Changed File Coverage

Coverage analysis skipped — no coverage tool or project threshold was detected.

### Assertion Quality

**Assertion quality**: ✅ Changed tests call production code and verify observable values/statuses. The corrective test proves both accepted compact and rejected dotted RUT representations; fixed non-empty tables prevent ghost loops.

### Quality Metrics

**Linter**: ➖ No backend linter configured.

**Type Checker**: ✅ No errors from the required backend-scoped command.

### Issues Found

**CRITICAL**: None.

**WARNING**: None.

**SUGGESTION**: None.

### Verdict

**PASS**

All 10 tasks, 6 requirements, and 13 scenarios are independently verified. The prior normalized-RUT defect is remediated with behavioral RED/GREEN evidence, the full suite passes, and compiled production bootstrap parity is proven dynamically.
