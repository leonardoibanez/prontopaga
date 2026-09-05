```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:d9f61abae53e888a1233e885622db7fcc59df3159bbc6a30c4f389e35366176a
verdict: pass_with_warnings
blockers: 0
critical_findings: 0
requirements: 4/4
scenarios: 6/6
test_command: 'export PATH="/tmp/node-v24.20.0-darwin-arm64/bin:$PATH"; bash -o pipefail -c ''npm test && node /tmp/backend-foundation-main-entrypoint.verify.cjs'''
test_exit_code: 0
test_output_hash: sha256:70968a94c87a0420156ba69af92fc509bc95b08ef1b8a882566ecb7b445a7e7d
build_command: 'export PATH="/tmp/node-v24.20.0-darwin-arm64/bin:$PATH"; npm run build -w backend'
build_exit_code: 0
build_output_hash: sha256:017a6a91cbab5e2cc77a20f2093d3df2b964921561dfd398b7c237c94e40d7fe
```

## Verification Report

**Change**: `backend-foundation`
**Version**: N/A
**Mode**: Strict TDD corrective verification
**Remediates evidence**: `sha256:c1199129f3acf5cc1194e8980c378bfad0ca1997b08f8265ab0324db3967530c`

### Completeness
| Metric | Value |
|--------|-------|
| Tasks total | 6 |
| Tasks complete | 6 |
| Tasks incomplete | 0 |

### Build & Tests Execution
**Build**: ✅ Passed
```text
export PATH="/tmp/node-v24.20.0-darwin-arm64/bin:$PATH"; npm run build -w backend
Exit 0; Nest build completed without errors.
Output hash: sha256:017a6a91cbab5e2cc77a20f2093d3df2b964921561dfd398b7c237c94e40d7fe
```

**Tests and entry-point runtime verification**: ✅ 8 registered tests plus 2/2 isolated production-entry-point cases passed
```text
export PATH="/tmp/node-v24.20.0-darwin-arm64/bin:$PATH"; bash -o pipefail -c 'npm test && node /tmp/backend-foundation-main-entrypoint.verify.cjs'
Exit 0.
node:test: 8 tests, 8 passed, 0 failed, 0 cancelled, 0 skipped.
Configured production case: ephemeral verified-free port, health 200, prefix 404, configured CORS, preflight 204, SIGTERM shutdown, port released.
Default production case: verified-free port 3001, health 200, prefix 404, default CORS, preflight 204, SIGTERM shutdown, port released.
Output hash: sha256:70968a94c87a0420156ba69af92fc509bc95b08ef1b8a882566ecb7b445a7e7d
Harness hash: sha256:f57c013efd941ebc6c1d476073b8528c0b2cf8059c14abe938608cd491c1d374
```

**Type check**: ✅ Passed
```text
export PATH="/tmp/node-v24.20.0-darwin-arm64/bin:$PATH"; npm run typecheck -w backend
Exit 0; tsc --noEmit completed without errors.
Output hash: sha256:9e740f88053be81bd013f40e4e863c37e7287ba648a790a2fa548ae31e280c5d
```

**Coverage**: ➖ Not available — no coverage command or threshold is configured.

### Spec Compliance Matrix
| Requirement | Scenario | Runtime Evidence | Result |
|-------------|----------|------------------|--------|
| Shared bootstrap parity | Production and test share configuration | Repository tests exercise the shared factory; the isolated harness spawns compiled `dist/main.js` for configured and default environments; source inspection confirms both paths call `createApplication` without duplicated prefix/CORS/shutdown settings | ✅ COMPLIANT |
| Health endpoint compatibility | Health request succeeds | Repository HTTP test and both production-entry-point cases assert status 200, exact service fields, and parseable timestamp | ✅ COMPLIANT |
| Health endpoint compatibility | Prefix remains enforced | Repository HTTP test and both production-entry-point cases assert `/health` returns 404 | ✅ COMPLIANT |
| Environment and CORS defaults | Configured and default values apply | Configured production case listens on a verified-free ephemeral port with configured CORS; unset environment case listens on verified-free port 3001 with default CORS | ✅ COMPLIANT |
| Environment and CORS defaults | Invalid port is rejected | `parseBootstrapConfig rechaza puertos inválidos con el mensaje existente` passes for non-numeric, below-range, and above-range values | ✅ COMPLIANT |
| Deterministic lifecycle and teardown | Test server releases resources | Repository teardown test passes; both production children exit on SIGTERM and their ports can be rebound afterward | ✅ COMPLIANT |

**Compliance summary**: 6/6 scenarios compliant; 4/4 requirements compliant.

### Correctness (Static and Runtime Evidence)
| Requirement | Status | Notes |
|------------|--------|-------|
| Shared bootstrap parity | ✅ Implemented | Both test construction and real production startup execute the shared factory configuration. |
| Health endpoint compatibility | ✅ Implemented | The shared factory and compiled production entry point both preserve health and prefix behavior. |
| Environment and CORS defaults | ✅ Implemented | Parser, CORS, and real configured/default production listening behavior all passed. |
| Deterministic lifecycle and teardown | ✅ Implemented | Test teardown and production SIGTERM shutdown released their exact bound ports. |

### Coherence (Design)
| Decision | Followed? | Notes |
|----------|-----------|-------|
| Pure parser and reusable factory | ✅ Yes | Implemented in `backend/src/bootstrap.ts` without extra DI abstractions. |
| Explicit environment input | ✅ Yes | Tests pass isolated objects; production consumes child-specific environment variables. |
| Production owns listening | ✅ Yes | Real compiled entry-point cases prove `main.ts` owns configured/default listening. |
| Real HTTP verification without dependencies | ✅ Yes | Existing `node:test` plus a temporary built-in Node harness use real loopback HTTP and process signals. |

### TDD Compliance
| Check | Result | Details |
|-------|--------|---------|
| TDD Evidence reported | ✅ | The unchanged apply-progress artifact contains all 6 task rows. |
| All tasks have tests | ✅ | 5/5 behavioral/implementation tasks reference the repository test; task 3.2 is evidence-only. |
| RED confirmed | ⚠️ | The recorded historical RED is an actual missing `../dist/bootstrap` module failure before test discovery; it proves the bootstrap dependency was absent, not that each behavioral assertion independently failed. |
| GREEN confirmed | ✅ | All 8 repository tests and both independent production-entry-point cases pass now. |
| Triangulation adequate | ✅ | Explicit/default/invalid configuration, health, prefix, configured/default CORS, teardown, and configured/default production startup vary inputs and outcomes. |
| Safety Net for modified files | ✅ | Apply evidence records the pre-change root suite at 1/1 pass; `bootstrap.ts` was new. |

**TDD Compliance**: 5/6 checks fully confirmed. Historical RED evidence remains accurately bounded and was not recreated or overstated.

### Test Layer Distribution
| Layer | Cases | Files | Tools |
|-------|-------|-------|-------|
| Unit | 3 | 1 | `node:test` |
| Integration/runtime | 7 | 2 | `node:test`, built-in `child_process`, `fetch`, and `net` |
| E2E | 0 | 0 | Not installed |
| **Total** | **10** | **2** | One repository test file plus the reproduced temporary harness below |

### Changed File Coverage
Coverage analysis skipped — no coverage tool detected.

### Assertion Quality
**Assertion quality**: ✅ All repository and temporary-harness assertions exercise production code and observable behavior. The invalid-port loop uses a fixed non-empty literal list and is not a ghost loop.

### Quality Metrics
**Linter**: ➖ Not available for the backend
**Type Checker**: ✅ No errors
**Diff Check**: ✅ `git diff --check` exited 0

### Issues Found
**CRITICAL**: None.

**WARNING**:
1. Historical RED evidence remains limited to the expected missing compiled bootstrap module before test discovery; it does not demonstrate separate behavior-level failing assertions.

**SUGGESTION**: None.

### Process Isolation and Cleanup Evidence
- Each child ran the absolute compiled `backend/dist/main.js` with a temporary empty working directory, preventing repository `.env` discovery.
- The harness checked that each target port was free before spawning. The default case fails closed if port 3001 is occupied.
- Requests were accepted only after the exact spawned child remained alive and its startup log named the expected port.
- Cleanup signaled only the exact `child.pid` returned by `spawn`; it never used `pkill`, broad PID matching, or an unrelated process handle.
- Both children exited with `SIGTERM`, their ports were rebound successfully, temporary directories were removed, and the post-run scan found no matching backend/test Node process.

### Reproducible Production Entrypoint Harness
Materialize the following exact bytes as `/tmp/backend-foundation-main-entrypoint.verify.cjs`. Its admitted run used SHA-256 `f57c013efd941ebc6c1d476073b8528c0b2cf8059c14abe938608cd491c1d374`.

```javascript
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { mkdtemp, rm } = require('node:fs/promises');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');

const node = '/tmp/node-v24.20.0-darwin-arm64/bin/node';
const main = '/Users/leonardo/Dev/prontopaga/backend/dist/main.js';
const host = '127.0.0.1';

function listenOnce(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(port, host, () => resolve(server));
  });
}

async function provePortFree(port) {
  const server = await listenOnce(port);
  const address = server.address();
  const selected = address.port;
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return selected;
}

async function waitForHealth(port, child) {
  const deadline = Date.now() + 5000;
  let lastError;
  while (Date.now() < deadline) {
    assert.equal(child.exitCode, null, `child ${child.pid} exited before health check`);
    try {
      const response = await fetch(`http://${host}:${port}/api/health`);
      if (response.status === 200) return response;
      lastError = new Error(`unexpected health status ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw lastError ?? new Error('health endpoint did not become available');
}

function waitForExit(child, timeoutMs) {
  return new Promise((resolve, reject) => {
    if (child.exitCode !== null || child.signalCode !== null) {
      resolve({ code: child.exitCode, signal: child.signalCode });
      return;
    }
    const timer = setTimeout(() => reject(new Error(`child ${child.pid} did not exit`)), timeoutMs);
    child.once('exit', (code, signal) => {
      clearTimeout(timer);
      resolve({ code, signal });
    });
  });
}

async function runCase(label, requestedPort, frontendUrl) {
  const port = await provePortFree(requestedPort);
  const cwd = await mkdtemp(path.join(os.tmpdir(), `backend-foundation-${label}-`));
  const env = { ...process.env };
  delete env.PORT;
  delete env.FRONTEND_URL;
  if (requestedPort !== 3001) env.PORT = String(port);
  if (frontendUrl !== 'http://localhost:3000') env.FRONTEND_URL = frontendUrl;

  const child = spawn(node, [main], { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => { stdout += chunk; });
  child.stderr.on('data', (chunk) => { stderr += chunk; });

  try {
    const health = await waitForHealth(port, child);
    const body = await health.json();
    assert.equal(body.status, 'ok');
    assert.equal(body.service, 'Consulta Riesgo Financiero');
    assert.ok(Number.isFinite(Date.parse(body.timestamp)));

    const unprefixed = await fetch(`http://${host}:${port}/health`);
    assert.equal(unprefixed.status, 404);

    const cors = await fetch(`http://${host}:${port}/api/health`, {
      headers: { origin: frontendUrl },
    });
    assert.equal(cors.headers.get('access-control-allow-origin'), frontendUrl);

    const preflight = await fetch(`http://${host}:${port}/api/health`, {
      method: 'OPTIONS',
      headers: {
        origin: frontendUrl,
        'access-control-request-method': 'GET',
      },
    });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('access-control-allow-origin'), frontendUrl);

    assert.match(stdout, new RegExp(`API disponible en http://localhost:${port}/api`));
    const pid = child.pid;
    assert.ok(Number.isInteger(pid) && pid > 0);
    assert.equal(child.kill('SIGTERM'), true, `failed to signal spawned child ${pid}`);
    const exit = await waitForExit(child, 5000);
    assert.equal(exit.signal, 'SIGTERM');
    await provePortFree(port);
    console.log(`${label}: pid=${pid} port=${port} health=200 prefix=404 cors=${frontendUrl} preflight=204 exit=SIGTERM released=true`);
  } finally {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill('SIGKILL');
      await waitForExit(child, 2000).catch(() => {});
    }
    await rm(cwd, { recursive: true, force: true });
    if (stderr) process.stderr.write(`${label} stderr:\n${stderr}`);
  }
}

(async () => {
  const dynamicPort = await provePortFree(0);
  await runCase('configured', dynamicPort, 'https://cliente.example');
  await runCase('defaults', 3001, 'http://localhost:3000');
  console.log('entrypoint verification: 2/2 cases passed; only exact spawned child PIDs were signaled');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### Verdict
PASS WITH WARNINGS
All four requirements and all six scenarios have passing runtime coverage. The only warning preserves the bounded historical TDD RED evidence; it does not contradict current behavioral compliance.
