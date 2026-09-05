require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHmac } = require('node:crypto');
const { spawn } = require('node:child_process');
const path = require('node:path');
const { JwtService } = require('@nestjs/jwt');
const { createApplication, parseBootstrapConfig } = require('../dist/bootstrap');
const { AuthGuard } = require('../dist/auth/auth.guard');

const TEST_JWT_SECRET = 'test-only-secret-that-is-long-enough';

async function startApplication(t) {
  const app = await createApplication(
    parseBootstrapConfig({ JWT_SECRET: TEST_JWT_SECRET }),
    { logger: false },
  );
  t.after(() => app.close());
  await app.listen(0, '127.0.0.1');
  return app;
}

async function login(app, body, options = {}) {
  return fetch(`${await app.getUrl()}${options.path ?? '/login'}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...options.headers },
    body: options.rawBody ?? JSON.stringify(body),
  });
}

function parseToken(token) {
  const [encodedHeader, encodedPayload] = token.split('.');
  return {
    header: JSON.parse(Buffer.from(encodedHeader, 'base64url').toString('utf8')),
    payload: JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')),
  };
}

function guardContext(request) {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  };
}

function signRawHs256(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const unsigned = `${header}.${encodedPayload}`;
  return `${unsigned}.${createHmac('sha256', TEST_JWT_SECRET).update(unsigned).digest('base64url')}`;
}

function runChildWithoutSecret() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['dist/main.js'], {
      cwd: path.resolve(__dirname, '..'),
      env: { ...process.env, JWT_SECRET: '', PORT: '3001' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stderr = '';
    let finished = false;
    const timeout = setTimeout(() => {
      if (child.pid !== undefined && child.exitCode === null) {
        process.kill(child.pid, 'SIGKILL');
      }
      reject(new Error(`dist/main.js did not stop without JWT_SECRET (pid ${child.pid})`));
    }, 5_000);

    const capture = (chunk) => {
      stderr += chunk.toString();
    };
    child.stdout.on('data', capture);
    child.stderr.on('data', capture);
    child.once('error', (error) => {
      if (!finished) {
        finished = true;
        clearTimeout(timeout);
        reject(error);
      }
    });
    child.once('exit', (code, signal) => {
      if (!finished) {
        finished = true;
        clearTimeout(timeout);
        resolve({ code, signal, stderr, pid: child.pid });
      }
    });
  });
}

test('POST /login accepts exact demo credentials and returns the bearer contract', async (t) => {
  const app = await startApplication(t);
  const response = await login(app, {
    username: 'demo.admin',
    password: 'AdminDemo!2026',
  });

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(typeof body.access_token, 'string');
  assert.ok(body.access_token.length > 20);
  assert.equal(body.token_type, 'Bearer');
  assert.equal(body.expires_in, 900);
  const { header, payload } = parseToken(body.access_token);
  assert.equal(header.alg, 'HS256');
  assert.equal(payload.sub, 'synthetic-admin-001');
  assert.equal(payload.role, 'admin');
  assert.equal('rut' in payload, false);
  assert.equal(payload.exp - payload.iat, 900);
});

test('POST /login issues server-derived claims for all three synthetic identities', async (t) => {
  const app = await startApplication(t);
  const credentials = [
    ['demo.admin', 'AdminDemo!2026', 'synthetic-admin-001', 'admin', undefined],
    ['demo.user1', 'UserOneDemo!2026', 'synthetic-user-001', 'user', '12345678-5'],
    ['demo.user2', 'UserTwoDemo!2026', 'synthetic-user-002', 'user', '9876543-3'],
  ];

  for (const [username, password, sub, role, rut] of credentials) {
    const response = await login(app, { username, password });
    assert.equal(response.status, 200);
    const { payload } = parseToken((await response.json()).access_token);
    assert.equal(payload.sub, sub);
    assert.equal(payload.role, role);
    assert.equal(payload.rut, rut);
  }
});

test('POST /login rejects non-object, malformed, missing, and extra credential fields', async (t) => {
  const app = await startApplication(t);
  const invalidBodies = [
    [],
    null,
    'not-an-object',
    { username: 'demo.admin' },
    { username: 123, password: 'AdminDemo!2026' },
    { username: 'demo.admin', password: false },
    { username: 'demo.admin', password: 'AdminDemo!2026', role: 'admin' },
    { username: 'demo.user1', password: 'UserOneDemo!2026', rut: '12345678-5' },
  ];

  for (const body of invalidBodies) {
    const response = await login(app, body);
    assert.equal(response.status, 400);
  }

  const malformed = await login(app, undefined, { rawBody: '{' });
  assert.equal(malformed.status, 400);

  const oversized = await login(app, { username: 'demo.admin', password: 'x'.repeat(17 * 1024) });
  assert.equal(oversized.status, 413);
});

test('POST /login gives the same generic response for unknown usernames and wrong passwords', async (t) => {
  const app = await startApplication(t);
  const unknown = await login(app, {
    username: 'not-a-user',
    password: 'UserOneDemo!2026',
  });
  const wrongPassword = await login(app, {
    username: 'demo.user1',
    password: 'NotTheDemoPassword!2026',
  });

  assert.equal(unknown.status, 401);
  assert.equal(wrongPassword.status, 401);
  assert.deepEqual(await unknown.json(), await wrongPassword.json());
});

test('POST /login is literal and does not replace the api-prefixed route contract', async (t) => {
  const app = await startApplication(t);
  const response = await login(
    app,
    { username: 'demo.admin', password: 'AdminDemo!2026' },
    { path: '/api/login' },
  );

  assert.equal(response.status, 404);
});

test('compiled production startup fails closed without JWT_SECRET and terminates its child process', async () => {
  const result = await runChildWithoutSecret();

  assert.equal(result.code, 1);
  assert.equal(result.signal, null);
  assert.ok(result.stderr.includes('JWT_SECRET'));
  assert.equal(result.stderr.includes(TEST_JWT_SECRET), false);
});

test('AuthGuard reconstructs valid admin and user principals from issued bearer tokens', async (t) => {
  const app = await startApplication(t);
  const guard = app.get(AuthGuard);
  for (const [username, password, expectedPrincipal] of [
    ['demo.admin', 'AdminDemo!2026', { sub: 'synthetic-admin-001', role: 'admin' }],
    ['demo.user1', 'UserOneDemo!2026', { sub: 'synthetic-user-001', role: 'user', rut: '12345678-5' }],
  ]) {
    const response = await login(app, { username, password });
    const request = {
      headers: { authorization: `Bearer ${(await response.json()).access_token}` },
    };
    assert.equal(guard.canActivate(guardContext(request)), true);
    assert.deepEqual(request.user, expectedPrincipal);
  }
});

test('AuthGuard requires user RUT claims to already use the catalog normalization', async (t) => {
  const app = await startApplication(t);
  const guard = app.get(AuthGuard);
  const jwt = app.get(JwtService);

  for (const [rut, expectedStatus] of [
    ['12345678-5', 'accepted'],
    ['12.345.678-5', 'rejected'],
  ]) {
    const request = {
      headers: {
        authorization: `Bearer ${jwt.sign({
          sub: 'synthetic-user-001',
          role: 'user',
          rut,
        })}`,
      },
    };

    if (expectedStatus === 'accepted') {
      assert.equal(guard.canActivate(guardContext(request)), true);
      assert.deepEqual(request.user, {
        sub: 'synthetic-user-001',
        role: 'user',
        rut: '12345678-5',
      });
      continue;
    }

    assert.throws(() => guard.canActivate(guardContext(request)), { status: 401 });
    assert.equal(request.user, undefined);
  }
});

test('AuthGuard uniformly denies malformed, untrusted, expired, and claim-drift bearer tokens', async (t) => {
  const app = await startApplication(t);
  const guard = app.get(AuthGuard);
  const jwt = app.get(JwtService);
  const validResponse = await login(app, {
    username: 'demo.user1',
    password: 'UserOneDemo!2026',
  });
  const validToken = (await validResponse.json()).access_token;
  const noneToken = `${Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')}.${Buffer.from(JSON.stringify({ sub: 'synthetic-user-001', role: 'user' })).toString('base64url')}.`;
  const invalidTokens = [
    undefined,
    'Basic credentials',
    'Bearer',
    'Bearer malformed-token',
    `Bearer ${validToken}tampered`,
    `Bearer ${jwt.sign({ sub: 'synthetic-user-001', role: 'user', rut: '12345678-5' }, { expiresIn: -1 })}`,
    `Bearer ${jwt.sign({ sub: 'synthetic-user-001', role: 'user', rut: '12345678-5' }, { algorithm: 'HS384' })}`,
    `Bearer ${noneToken}`,
    `Bearer ${jwt.sign({ sub: 'unknown-user', role: 'user', rut: '12345678-5' })}`,
    `Bearer ${jwt.sign({ sub: 'synthetic-user-001', role: 'admin' })}`,
    `Bearer ${jwt.sign({ sub: 'synthetic-user-001', role: 'user', rut: '11111111-1' })}`,
    `Bearer ${signRawHs256({ sub: 'synthetic-user-001', role: 'user', rut: '12345678-5', iat: 'not-a-number', exp: Math.floor(Date.now() / 1000) + 900 })}`,
  ];

  for (const authorization of invalidTokens) {
    const request = { headers: { authorization } };
    assert.throws(() => guard.canActivate(guardContext(request)), { status: 401 });
    assert.equal(request.user, undefined);
  }
});
