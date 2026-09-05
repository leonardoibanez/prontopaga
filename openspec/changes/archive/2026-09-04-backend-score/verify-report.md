```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:a1f1df79a319bb7096f81d6715f7aae513bd9bebb4a334c7c32e3266fd4b855b
verdict: pass
blockers: 0
critical_findings: 0
requirements: 4/4
scenarios: 11/11
test_command: PATH="/tmp/node-v24.20.0-darwin-arm64/bin:$PATH" npm test
test_exit_code: 0
test_output_hash: sha256:eb643013b4dd5f7d6c42df60d92c7a081499d9b38fdae7757b4bc8227c55de2e
build_command: PATH="/tmp/node-v24.20.0-darwin-arm64/bin:$PATH" sh -c 'npm run build -w backend && npm run typecheck -w backend'
build_exit_code: 0
build_output_hash: sha256:32d69d05a59810857b6b34215a978b95132de0d807cd4cda8152be02bf7b74e4
```

## Verification Report

**Change**: backend-score  
**Version**: N/A  
**Mode**: Strict TDD  
**Scope**: Backend score contract only; this is not a whole-application security or coverage certification.

### Completeness

| Metric | Value |
|---|---:|
| Requirements | 4/4 |
| Scenarios | 11/11 |
| Tasks total | 9 |
| Tasks complete | 9 |
| Tasks incomplete | 0 |

The authoritative counts come from four `### Requirement:` headings and eleven `#### Scenario:` headings in `openspec/changes/backend-score/specs/backend-score/spec.md`.

### Build & Tests Execution

**Root tests**: ✅ 30 passed, 0 failed, 0 skipped; exit 0.

```text
PATH="/tmp/node-v24.20.0-darwin-arm64/bin:$PATH" npm test
node:test: tests 30, pass 30, fail 0, cancelled 0, skipped 0, todo 0
output sha256: eb643013b4dd5f7d6c42df60d92c7a081499d9b38fdae7757b4bc8227c55de2e
```

**Backend build and typecheck**: ✅ Both passed; combined exit 0.

```text
PATH="/tmp/node-v24.20.0-darwin-arm64/bin:$PATH" sh -c 'npm run build -w backend && npm run typecheck -w backend'
@consulta-riesgo/backend build: nest build
@consulta-riesgo/backend typecheck: tsc --noEmit
output sha256: 32d69d05a59810857b6b34215a978b95132de0d807cd4cda8152be02bf7b74e4
```

**Production-entry runtime harness**: ✅ `backend/dist/main.js` passed; exit 0; output sha256 `a95736ebe103a1590642462271a64d640013ec6c7c4cba4d080642813a95077c`.

The transient harness spawned the compiled production entry as an exact child PID with a synthetic verification secret and fixed local port, polled `/api/health`, obtained real login tokens, exercised the score boundary, and terminated only that child. Observed results:

```text
missing-auth-invalid-rut: status=401 cache=no-store
invalid-auth-invalid-rut: status=401 cache=no-store
authenticated-invalid-rut: status=400 cache=no-store
other-user-rut: status=403 cache=no-store
own-user-rut: status=200 cache=no-store
admin-arbitrary-k-rut: status=200 cache=no-store
route-compatibility: /api/score=404 /api/health=200 /login=200
runtime-harness: PASS
cleanup: child exited by SIGTERM
```

Executed transient harness code (credentials and secret were synthetic, and the file was removed after verification):

```js
const child = spawn(process.execPath, ['backend/dist/main.js'], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: '43891', JWT_SECRET: 'verify-only-secret-that-is-long-enough' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
await waitForHealth('/api/health');
const user = await login('demo.user1', 'UserOneDemo!2026');
const admin = await login('demo.admin', 'AdminDemo!2026');
const cases = [
  ['missing-auth-invalid-rut', await score('not-a-rut'), 401],
  ['invalid-auth-invalid-rut', await scoreWithRawAuth('not-a-rut', 'Bearer invalid'), 401],
  ['authenticated-invalid-rut', await score('not-a-rut', user), 400],
  ['other-user-rut', await score('9876543-3', user), 403],
  ['own-user-rut', await score('12.345.678-5', user), 200],
  ['admin-arbitrary-k-rut', await score('6-k', admin), 200],
];
for (const [name, response, expected] of cases) {
  assert.equal(response.status, expected, name);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const body = await response.json();
  if (expected === 200) assert.deepEqual(Object.keys(body).sort(), ['fecha', 'rut', 'score']);
  else assert.deepEqual(Object.keys(body).sort(), ['message', 'statusCode']);
}
assert.equal((await fetch(`${base}/api/score/12345678-5`)).status, 404);
assert.equal((await fetch(`${base}/api/health`)).status, 200);
child.kill('SIGTERM'); // exact spawned child only; bounded SIGKILL fallback after 2 seconds
await childExit;
```

**Authentication-order runtime probe**: ✅ A live Nest HTTP application wrapped the resolved `ScoreController` instance; unauthenticated `/score/not-a-rut` returned `401` with `no-store` and `controllerCalls=0`. The app closed and the transient override was discarded. Exit 0; output sha256 `c1cac9f36f40b78ff63975687a84bf0adecb0a924dad4354acd703aa9b1dbcc7`.

**Verifier harness calibration**: Three bounded harness-only failures preceded the admitted evidence and did not indicate production failures: (1) the first production-child harness expected Nest denial bodies to include an `error` key, but the observed stable shape was only `message` and `statusCode`; it exited 1 with output sha256 `51a3d31db55618a6328f9d346f3dca55570b6b92100e630e81c275485c83139d`, and its exact child still terminated by `SIGTERM`; (2) the first authentication-order probe could not resolve `reflect-metadata` from `/tmp`, exited 1 with sha256 `f77b30556eace645d28d2fa51db5f594c059df9c8d858fae9aa808bec00dbb32`, and started no app; (3) a prototype-level wrapper removed the controller method's route metadata, producing verifier-induced `404` instead of exercising the guard, exited 1 with sha256 `75eddde5588e3ce1afba7bebefe67aec74fb0a53a495c6b7cee06b935ab55f75`, and closed the app. The final probes corrected only transient harness code: denial assertions check the actually observed generic body plus absence of known RUT values, module loading uses the repository path, and the auth-order wrapper is installed on the resolved controller instance without altering route metadata.

**Coverage**: ➖ Skipped — no coverage command is declared in the cached capability contract. This report does not infer line or branch coverage from passing tests.

### Spec Compliance Matrix

| Requirement | Scenario | Runtime evidence | Result |
|---|---|---|---|
| Protected root score route and compatibility | Existing routes remain compatible | `score.test.cjs` HTTP contract test; production harness `/login=200`, `/api/health=200` | ✅ COMPLIANT |
| Protected root score route and compatibility | Score route is rooted and protected | HTTP test and production harness: `/score` unauthenticated `401`; `/api/score` `404` | ✅ COMPLIANT |
| Authenticate, validate, and authorize in order | Authentication failure precedes RUT disclosure | HTTP invalid-RUT requests with missing/invalid auth return `401`; runtime probe records `controllerCalls=0` | ✅ COMPLIANT |
| Authenticate, validate, and authorize in order | Authenticated invalid RUT is rejected | HTTP test and production harness return `400` | ✅ COMPLIANT |
| Authenticate, validate, and authorize in order | Ownership is enforced | HTTP test covers own user `200`, other user `403`, and a second user's own RUT `200` | ✅ COMPLIANT |
| Authenticate, validate, and authorize in order | Administrator access is broad | HTTP test and production child accept admin access to arbitrary valid `6-k`, returning canonical `6-K` | ✅ COMPLIANT |
| Authenticate, validate, and authorize in order | Denials do not compute protected outputs | Unit calculator/clock spies remain zero for invalid and unauthorized service calls; auth runtime probe never invokes controller | ✅ COMPLIANT |
| Return deterministic synthetic consultation data | Equivalent inputs produce one stable score | Unit goldens plus two-instance HTTP test; dotted/compact and lowercase/uppercase K equivalence; timestamps differ and match UTC ISO shape | ✅ COMPLIANT |
| Return deterministic synthetic consultation data | Success payload is exact | HTTP test and production harness assert exactly `rut`, `score`, `fecha`, integer range, canonical RUT, ISO timestamp | ✅ COMPLIANT |
| Prevent protected response caching | Success and denial responses are non-cacheable | HTTP matrix and production child verify exact `Cache-Control: no-store` for `200/401/400/403` | ✅ COMPLIANT |
| Scope constraints | Scoring remains synthetic and isolated | Calculator unit test executes SHA-256 directly; source imports only Node crypto and pure RUT utilities; no database/provider/registry dependency or new package | ✅ COMPLIANT |

**Compliance summary**: 11/11 scenarios compliant through passing runtime evidence.

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|---|---|---|
| Protected root route | ✅ Implemented | `bootstrap.ts` excludes only GET `score/:rut` from `/api`; controller remains guarded. |
| Ordered authorization | ✅ Implemented | Guard precedes controller; service validates, normalizes, authorizes, then calculates and timestamps. |
| Deterministic score | ✅ Implemented | SHA-256 over canonical undotted RUT with hyphen retained; `readUInt32BE(0) % 101`; independent goldens 87, 33, 83 pass. |
| Non-cacheability | ✅ Implemented | Route-scoped middleware runs before guards and sets `no-store` for all observed outcomes. |

### Coherence (Design)

| Decision | Followed? | Notes |
|---|---|---|
| Reuse one configured auth dynamic module | ✅ Yes | `AppModule.register` creates once and passes the same value to `ScoreModule.register`. |
| Middleware before guards for no-store | ✅ Yes | Live denial responses include the header. |
| Ordered service flow | ✅ Yes | Denial spies and authentication-order runtime probe corroborate short-circuiting. |
| Narrow calculator and clock tokens | ✅ Yes | Unit tests inject function seams without global crypto/time mocks. |

### TDD Compliance

| Check | Result | Details |
|---|---|---|
| TDD evidence reported | ✅ | `apply-progress.md` records baseline 25/25, behavioral RED 25 pass/4 fail with compilable unregistered stubs, then GREEN 30/30. |
| All work items evidenced | ✅ | 9/9 tasks checked; behavioral tasks map to `backend/test/score.test.cjs`, while docs/build tasks have direct file/command evidence. |
| RED evidence retained | ✅ | Historical failing output is recorded in apply progress; verification confirms the named test file and production stubs/implementation paths exist. Historical RED was not recreated because verification does not revert production code. |
| GREEN confirmed | ✅ | Current root execution passes 30/30, including all five score tests. |
| Triangulation adequate | ✅ | Three independent hard-coded goldens, equivalent formats, two identities, two app instances, multiple denial classes, and distinct timestamps. |
| Safety net reported | ✅ | Pre-change 25/25 baseline is recorded before the score implementation. |

**TDD compliance**: 6/6 checks satisfied by retained RED evidence and independently executed GREEN evidence.

### Test Layer Distribution

| Layer | Tests | Files | Tools |
|---|---:|---:|---|
| Unit | 3 | 1 | `node:test` |
| HTTP integration | 2 | 1 | `node:test`, real Nest/HTTP apps |
| Browser E2E | 0 | 0 | Not applicable to backend-only scope |
| **Score total** | **5** | **1** | |

The root suite additionally passed 25 pre-existing backend tests. The production-entry and authentication-order probes are verification harnesses, not persisted test-count inflation.

### Changed File Coverage

Coverage analysis skipped — no declared coverage command/tool. No coverage percentage is claimed.

### Assertion Quality

**Assertion quality**: ✅ All 28 score-test assertions call production behavior or inspect real HTTP outcomes. No tautologies, orphan empty checks, ghost loops, smoke-only assertions, or mock-heavy patterns were found. The looped HTTP matrix has seven non-empty cases fixed in the test source.

### Quality Metrics

**Linter**: ➖ Not run — the repository exposes only a frontend lint command, outside this backend-only verification scope.  
**Type Checker**: ✅ Backend `tsc --noEmit` passed with exit 0.  
**Build**: ✅ Backend Nest build passed with exit 0.

### Issues Found

**CRITICAL**: None.  
**WARNING**: None.  
**SUGGESTION**: None. Coverage remains unmeasured because no backend coverage command is declared; this is a stated evidence boundary, not inferred coverage or a contract failure.

### Cleanup Evidence

- The compiled production child was terminated by signal on its exact spawned child handle; the harness reported cleanup before exit.
- The live authentication-order application was closed.
- Both transient harness source files were removed after their contents and output hashes were captured in this report.
- No frontend build/typecheck, external target, production service, database, provider, commit, review, attempt acquire, or attempt settlement was invoked.

### Verdict

**PASS** — all 9 tasks are complete, all 4 requirements and 11 scenarios have passing runtime coverage, the backend test/build/typecheck commands pass under Node 24, and compiled production-entry HTTP behavior matches the scoped score contract.
