require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHmac } = require('node:crypto');
const { createApplication, parseBootstrapConfig } = require('../dist/bootstrap');
const { calculateSyntheticScore, ScoreService } = require('../dist/score/score.service');

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

async function login(app, username, password) {
  const response = await fetch(`${await app.getUrl()}/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  assert.equal(response.status, 200);
  return (await response.json()).access_token;
}

async function score(app, rut, authorization) {
  return fetch(`${await app.getUrl()}/score/${encodeURIComponent(rut)}`, {
    headers: authorization === undefined ? {} : { authorization },
  });
}

function signRawHs256(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const unsigned = `${header}.${encodedPayload}`;
  return `${unsigned}.${createHmac('sha256', TEST_JWT_SECRET).update(unsigned).digest('base64url')}`;
}

test('ScoreService calculates fixed synthetic goldens and only uses a trusted principal', () => {
  const calls = [];
  const service = new ScoreService(
    (rut) => {
      calls.push(`calculate:${rut}`);
      return { '12345678-5': 87, '9876543-3': 33, '6-K': 83 }[rut];
    },
    () => {
      calls.push('clock');
      return new Date('2026-09-04T12:00:00.000Z');
    },
  );
  const user = { sub: 'synthetic-user-001', role: 'user', rut: '12345678-5' };

  assert.deepEqual(service.consult('12.345.678-5', user), {
    rut: '12.345.678-5', score: 87, fecha: '2026-09-04T12:00:00.000Z',
  });
  assert.equal(service.consult('6-k', { sub: 'synthetic-admin-001', role: 'admin' }).score, 83);
  assert.equal(service.consult('6-K', { sub: 'synthetic-admin-001', role: 'admin' }).score, 83);
  assert.deepEqual(calls, ['calculate:12345678-5', 'clock', 'calculate:6-K', 'clock', 'calculate:6-K', 'clock']);
});

test('calculateSyntheticScore uses SHA-256 big-endian modulo 101 goldens', () => {
  assert.equal(calculateSyntheticScore('12345678-5'), 87);
  assert.equal(calculateSyntheticScore('9876543-3'), 33);
  assert.equal(calculateSyntheticScore('6-K'), 83);
});

test('ScoreService rejects invalid and unauthorized inputs before calculator or clock invocation', () => {
  let calculations = 0;
  let clocks = 0;
  const service = new ScoreService(
    () => {
      calculations += 1;
      return 0;
    },
    () => {
      clocks += 1;
      return new Date();
    },
  );
  const user = { sub: 'synthetic-user-001', role: 'user', rut: '12345678-5' };

  assert.throws(() => service.consult('not-a-rut', user), { status: 400 });
  assert.throws(() => service.consult('9876543-3', user), { status: 403 });
  assert.equal(calculations, 0);
  assert.equal(clocks, 0);
});

test('GET /score/:rut authenticates first, authorizes ownership, and marks all outcomes no-store', async (t) => {
  const app = await startApplication(t);
  const userToken = await login(app, 'demo.user1', 'UserOneDemo!2026');
  const secondUserToken = await login(app, 'demo.user2', 'UserTwoDemo!2026');
  const adminToken = await login(app, 'demo.admin', 'AdminDemo!2026');
  const now = Math.floor(Date.now() / 1000);
  const unknownClaims = signRawHs256({
    sub: 'unknown-user', role: 'user', rut: '12345678-5', iat: now, exp: now + 900,
  });
  const cases = [
    ['missing token with invalid RUT', 'not-a-rut', undefined, 401],
    ['invalid token with invalid RUT', 'not-a-rut', 'Bearer invalid-token', 401],
    ['unknown claims with invalid RUT', 'not-a-rut', `Bearer ${unknownClaims}`, 401],
    ['authenticated invalid RUT', 'not-a-rut', `Bearer ${userToken}`, 400],
    ['user accessing another valid RUT', '9876543-3', `Bearer ${userToken}`, 403],
    ['second user accessing its own valid RUT', '9876543-3', `Bearer ${secondUserToken}`, 200],
    ['administrator accessing any valid RUT', '9876543-3', `Bearer ${adminToken}`, 200],
  ];

  for (const [, rut, authorization, expectedStatus] of cases) {
    const response = await score(app, rut, authorization);
    assert.equal(response.status, expectedStatus);
    assert.equal(response.headers.get('cache-control'), 'no-store');
  }
});

test('GET /score/:rut has the exact root contract and remains deterministic across instances', async (t) => {
  const first = await startApplication(t);
  const second = await startApplication(t);
  const firstToken = await login(first, 'demo.user1', 'UserOneDemo!2026');
  const secondToken = await login(second, 'demo.user1', 'UserOneDemo!2026');

  const firstResponse = await score(first, '12.345.678-5', `Bearer ${firstToken}`);
  await new Promise((resolve) => setTimeout(resolve, 5));
  const secondResponse = await score(second, '123456785', `Bearer ${secondToken}`);
  assert.equal(firstResponse.status, 200);
  assert.equal(secondResponse.status, 200);
  const firstBody = await firstResponse.json();
  const secondBody = await secondResponse.json();
  assert.deepEqual(Object.keys(firstBody).sort(), ['fecha', 'rut', 'score']);
  assert.deepEqual(firstBody.rut, '12.345.678-5');
  assert.equal(firstBody.score, 87);
  assert.equal(secondBody.score, 87);
  assert.equal(typeof firstBody.score, 'number');
  assert.ok(firstBody.score >= 0 && firstBody.score <= 100);
  assert.match(firstBody.fecha, /^\d{4}-\d{2}-\d{2}T.*Z$/);
  assert.match(secondBody.fecha, /^\d{4}-\d{2}-\d{2}T.*Z$/);
  assert.notEqual(firstBody.fecha, secondBody.fecha);
  assert.equal((await fetch(`${await first.getUrl()}/api/score/12345678-5`)).status, 404);
  assert.equal((await fetch(`${await first.getUrl()}/api/health`)).status, 200);
  assert.equal((await fetch(`${await first.getUrl()}/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'demo.admin', password: 'AdminDemo!2026' }),
  })).status, 200);
});

test('GET /score/:rut rate limits an authenticated principal', async (t) => {
  const app = await startApplication(t);
  const token = await login(app, 'demo.user1', 'UserOneDemo!2026');
  let response;
  for (let attempt = 0; attempt < 61; attempt += 1) {
    response = await score(app, '12345678-5', `Bearer ${token}`);
  }

  assert.equal(response.status, 429);
  assert.equal(response.headers.get('retry-after'), '60');
  assert.equal(response.headers.get('cache-control'), 'no-store');
});
