// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';

const SCORE = { rut: '12.345.678-5', score: 87, fecha: '2026-09-06T12:00:00.000Z' };

function scoreRequest(cookie?: string) {
  return new NextRequest('http://127.0.0.1:3100/api/score/12.345.678-5', {
    headers: cookie ? { cookie: `crf_session=${cookie}` } : undefined,
  });
}

describe('GET /api/score/:rut', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('forwards the bearer cookie to the canonical score path', async () => {
    vi.stubEnv('BACKEND_URL', 'http://127.0.0.1:3101');
    vi.stubEnv('APP_ORIGIN', 'http://127.0.0.1:3100');
    const upstreamFetch = vi.fn().mockResolvedValue(Response.json(SCORE));
    vi.stubGlobal('fetch', upstreamFetch);

    const response = await GET(scoreRequest('access-token'), {
      params: Promise.resolve({ rut: '12.345.678-5' }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(SCORE);
    expect(upstreamFetch).toHaveBeenCalledWith(
      'http://127.0.0.1:3101/score/12.345.678-5',
      expect.objectContaining({
        cache: 'no-store',
        redirect: 'error',
        headers: expect.any(Headers),
      }),
    );
    expect((upstreamFetch.mock.calls[0][1]?.headers as Headers).get('authorization')).toBe('Bearer access-token');
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('maps missing authentication, forbidden ownership, and invalid RUT', async () => {
    vi.stubEnv('BACKEND_URL', 'http://127.0.0.1:3101');
    vi.stubEnv('APP_ORIGIN', 'http://127.0.0.1:3100');

    const missing = await GET(scoreRequest(), { params: Promise.resolve({ rut: '12.345.678-5' }) });
    expect(missing.status).toBe(401);
    await expect(missing.json()).resolves.toEqual({ status: 'error', code: 'SCORE_UNAUTHENTICATED' });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Forbidden', { status: 403 })));
    const forbidden = await GET(scoreRequest('access-token'), {
      params: Promise.resolve({ rut: '9876543-3' }),
    });
    expect(forbidden.status).toBe(403);
    await expect(forbidden.json()).resolves.toEqual({ status: 'error', code: 'SCORE_FORBIDDEN' });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Bad Request', { status: 400 })));
    const invalid = await GET(scoreRequest('access-token'), {
      params: Promise.resolve({ rut: 'no-es-rut' }),
    });
    expect(invalid.status).toBe(400);
    await expect(invalid.json()).resolves.toEqual({ status: 'error', code: 'SCORE_INVALID_RUT' });
  });

  it('clears a token rejected by the backend', async () => {
    vi.stubEnv('BACKEND_URL', 'http://127.0.0.1:3101');
    vi.stubEnv('APP_ORIGIN', 'http://127.0.0.1:3100');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 401 })));

    const response = await GET(scoreRequest('expired-token'), {
      params: Promise.resolve({ rut: '12345678-5' }),
    });

    expect(response.status).toBe(401);
    expect(response.cookies.get('crf_session')?.maxAge).toBe(0);
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it.each([
    Response.json({ status: 'error' }, { status: 500 }),
    new Response('not-json', { headers: { 'content-type': 'application/json' } }),
    Response.json({ ...SCORE, internal: 'must-not-leak' }),
    Response.json({ ...SCORE, fecha: '2026-09-06' }),
  ])('maps unsafe upstream score responses to a safe 502 %#', async (upstreamResponse) => {
    vi.stubEnv('BACKEND_URL', 'http://127.0.0.1:3101');
    vi.stubEnv('APP_ORIGIN', 'http://127.0.0.1:3100');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(upstreamResponse));

    const response = await GET(scoreRequest('access-token'), {
      params: Promise.resolve({ rut: '12345678-5' }),
    });

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ status: 'error', code: 'SCORE_UPSTREAM_ERROR' });
  });

  it('fails closed without explicit application configuration', async () => {
    vi.stubEnv('BACKEND_URL', 'http://127.0.0.1:3101');
    vi.stubEnv('APP_ORIGIN', '');

    const response = await GET(scoreRequest('access-token'), {
      params: Promise.resolve({ rut: '12345678-5' }),
    });

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ status: 'error', code: 'SCORE_CONFIG_ERROR' });
  });

  it('maps backend throttling without hiding the failure category', async () => {
    vi.stubEnv('BACKEND_URL', 'http://127.0.0.1:3101');
    vi.stubEnv('APP_ORIGIN', 'http://127.0.0.1:3100');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 429 })));

    const response = await GET(scoreRequest('access-token'), {
      params: Promise.resolve({ rut: '12345678-5' }),
    });

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({ status: 'error', code: 'SCORE_RATE_LIMITED' });
  });
});
