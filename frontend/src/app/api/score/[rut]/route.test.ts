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
        headers: { authorization: 'Bearer access-token' },
      }),
    );
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('maps missing authentication, forbidden ownership, and invalid RUT', async () => {
    vi.stubEnv('BACKEND_URL', 'http://127.0.0.1:3101');

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
});
