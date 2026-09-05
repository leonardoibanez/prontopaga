require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  createApplication,
  parseBootstrapConfig,
} = require('../dist/bootstrap');

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
    }),
    { frontendUrl: 'https://cliente.example', port: 4567 },
  );
});

test('parseBootstrapConfig aplica ambos valores predeterminados', () => {
  assert.deepEqual(parseBootstrapConfig({}), {
    frontendUrl: 'http://localhost:3000',
    port: 3001,
  });
});

test('parseBootstrapConfig rechaza puertos inválidos con el mensaje existente', () => {
  for (const port of ['not-a-number', '0', '65536']) {
    assert.throws(
      () => parseBootstrapConfig({ PORT: port }),
      new Error('PORT debe ser un número entre 1 y 65535.'),
    );
  }
});

test('GET /api/health responde con el estado del servicio', async (t) => {
  const app = await startApplication(t);
  const response = await fetch(`${await app.getUrl()}/api/health`);

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, 'ok');
  assert.equal(body.service, 'Consulta Riesgo Financiero');
  assert.ok(Number.isFinite(Date.parse(body.timestamp)));
});

test('la ruta de health sin el prefijo api no reemplaza el contrato', async (t) => {
  const app = await startApplication(t);
  const response = await fetch(`${await app.getUrl()}/health`);

  assert.equal(response.status, 404);
});

test('CORS usa el origen configurado para solicitudes y preflight', async (t) => {
  const frontendUrl = 'https://cliente.example';
  const app = await startApplication(t, { FRONTEND_URL: frontendUrl });
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
  const app = await startApplication(t);
  const response = await fetch(`${await app.getUrl()}/api/health`, {
    headers: { origin: frontendUrl },
  });

  assert.equal(response.headers.get('access-control-allow-origin'), frontendUrl);
});

test('el cierre de la aplicación libera el servidor efímero', async (t) => {
  const app = await startApplication(t);
  const server = app.getHttpServer();

  assert.equal(server.listening, true);
  await app.close();
  assert.equal(server.listening, false);
});
