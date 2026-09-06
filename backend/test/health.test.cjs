require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  createApplication,
  parseBootstrapConfig,
} = require('../dist/bootstrap');

const TEST_JWT_SECRET = 'test-only-secret-that-is-long-enough';

async function startApplication(t, environment = {}) {
  const app = await createApplication(parseBootstrapConfig(environment), {
    logger: false,
  });
  t.after(() => app.close());
  await app.listen(0, '127.0.0.1');
  return app;
}

test('parseBootstrapConfig conserva los valores explícitos', () => {
  assert.deepEqual(
    parseBootstrapConfig({
      FRONTEND_URL: 'https://cliente.example',
      PORT: '4567',
      JWT_SECRET: TEST_JWT_SECRET,
    }),
    {
      frontendUrl: 'https://cliente.example',
      host: '127.0.0.1',
      port: 4567,
      jwtSecret: TEST_JWT_SECRET,
      jwtIssuer: 'consulta-riesgo-backend',
      jwtAudience: 'consulta-riesgo-frontend',
      demoMode: true,
    },
  );
});

test('parseBootstrapConfig aplica ambos valores predeterminados', () => {
  assert.deepEqual(parseBootstrapConfig({ JWT_SECRET: TEST_JWT_SECRET }), {
    frontendUrl: 'http://localhost:3000',
    host: '127.0.0.1',
    port: 3001,
    jwtSecret: TEST_JWT_SECRET,
    jwtIssuer: 'consulta-riesgo-backend',
    jwtAudience: 'consulta-riesgo-frontend',
    demoMode: true,
  });
});

test('parseBootstrapConfig falla cuando JWT_SECRET falta, es débil o contiene espacios exteriores', () => {
  for (const JWT_SECRET of [undefined, '', '   ', 'x'.repeat(31), ` ${TEST_JWT_SECRET}`]) {
    assert.throws(() => parseBootstrapConfig({ JWT_SECRET }));
  }
});

test('parseBootstrapConfig rechaza orígenes inseguros y modo demo en producción', () => {
  for (const FRONTEND_URL of ['*', 'http://cliente.example', 'https://user:pass@cliente.example']) {
    assert.throws(() => parseBootstrapConfig({ FRONTEND_URL, JWT_SECRET: TEST_JWT_SECRET }));
  }
  assert.throws(() => parseBootstrapConfig({
    NODE_ENV: 'production',
    DEMO_MODE: 'true',
    JWT_SECRET: TEST_JWT_SECRET,
  }));
  assert.equal(parseBootstrapConfig({
    NODE_ENV: 'production',
    JWT_SECRET: TEST_JWT_SECRET,
  }).demoMode, false);
});

test('createApplication también rechaza una configuración con JWT_SECRET vacío', async () => {
  await assert.rejects(() =>
    createApplication(
      {
        frontendUrl: 'http://localhost:3000',
        host: '127.0.0.1',
        port: 3001,
        jwtSecret: '   ',
        jwtIssuer: 'consulta-riesgo-backend',
        jwtAudience: 'consulta-riesgo-frontend',
        demoMode: true,
      },
      { logger: false },
    ),
  );
});

test('parseBootstrapConfig rechaza puertos inválidos con el mensaje existente', () => {
  for (const port of ['not-a-number', '0', '65536']) {
    assert.throws(
      () => parseBootstrapConfig({ PORT: port, JWT_SECRET: TEST_JWT_SECRET }),
      new Error('PORT debe ser un número entre 1 y 65535.'),
    );
  }
});

test('GET /api/health responde con el estado del servicio', async (t) => {
  const app = await startApplication(t, { JWT_SECRET: TEST_JWT_SECRET });
  const response = await fetch(`${await app.getUrl()}/api/health`, {
    headers: { 'x-request-id': 'health-test-request' },
  });

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, 'ok');
  assert.equal(body.service, 'Consulta Riesgo Financiero');
  assert.ok(Number.isFinite(Date.parse(body.timestamp)));
  assert.equal(response.headers.get('x-request-id'), 'health-test-request');
});

test('la ruta de health sin el prefijo api no reemplaza el contrato', async (t) => {
  const app = await startApplication(t, { JWT_SECRET: TEST_JWT_SECRET });
  const response = await fetch(`${await app.getUrl()}/health`);

  assert.equal(response.status, 404);
});

test('CORS usa el origen configurado para solicitudes y preflight', async (t) => {
  const frontendUrl = 'https://cliente.example';
  const app = await startApplication(t, {
    FRONTEND_URL: frontendUrl,
    JWT_SECRET: TEST_JWT_SECRET,
  });
  const baseUrl = await app.getUrl();
  const response = await fetch(`${baseUrl}/api/health`, {
    headers: { origin: frontendUrl },
  });
  const preflight = await fetch(`${baseUrl}/api/health`, {
    method: 'OPTIONS',
    headers: {
      origin: frontendUrl,
      'access-control-request-method': 'GET',
    },
  });

  assert.equal(response.headers.get('access-control-allow-origin'), frontendUrl);
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-origin'), frontendUrl);
});

test('CORS usa el origen predeterminado cuando FRONTEND_URL no está definido', async (t) => {
  const frontendUrl = 'http://localhost:3000';
  const app = await startApplication(t, { JWT_SECRET: TEST_JWT_SECRET });
  const response = await fetch(`${await app.getUrl()}/api/health`, {
    headers: { origin: frontendUrl },
  });

  assert.equal(response.headers.get('access-control-allow-origin'), frontendUrl);
});

test('CORS no concede acceso a un origen diferente', async (t) => {
  const app = await startApplication(t, { JWT_SECRET: TEST_JWT_SECRET });
  const response = await fetch(`${await app.getUrl()}/api/health`, {
    headers: { origin: 'https://evil.test' },
  });

  assert.equal(response.headers.get('access-control-allow-origin'), null);
});

test('el cierre de la aplicación libera el servidor efímero', async (t) => {
  const app = await startApplication(t, { JWT_SECRET: TEST_JWT_SECRET });
  const server = app.getHttpServer();

  assert.equal(server.listening, true);
  await app.close();
  assert.equal(server.listening, false);
});
