// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';

const NOW = 1_800_000_000;

describe('GET /api/auth/session', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('returns an unauthenticated session without a cookie', async () => {
    vi.stubEnv('APP_ORIGIN', 'http://127.0.0.1:3100');
    vi.stubEnv('BACKEND_URL', 'http://127.0.0.1:3101');
    const response = await GET(new NextRequest('http://127.0.0.1:3100/api/auth/session'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ authenticated: false });
  });

  it('returns the public session for a live cookie and never echoes the token', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW * 1000);
    vi.stubEnv('APP_ORIGIN', 'http://127.0.0.1:3100');
    vi.stubEnv('BACKEND_URL', 'http://127.0.0.1:3101');
    const token = 'backend-signed-access-token';
    const upstreamFetch = vi.fn().mockResolvedValue(Response.json({
      role: 'admin',
      expires_at: NOW + 900,
    }));
    vi.stubGlobal('fetch', upstreamFetch);
    const response = await GET(new NextRequest('http://127.0.0.1:3100/api/auth/session', {
      headers: { cookie: `crf_session=${token}` },
    }));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ authenticated: true, role: 'admin' });
    expect(JSON.stringify(body)).not.toContain(token);
    expect(upstreamFetch).toHaveBeenCalledWith(
      'http://127.0.0.1:3101/me',
      expect.objectContaining({ headers: expect.any(Headers) }),
    );
    expect((upstreamFetch.mock.calls[0][1]?.headers as Headers).get('authorization')).toBe(`Bearer ${token}`);
  });

  it('rejects a forged cookie through the backend and removes it', async () => {
    vi.stubEnv('APP_ORIGIN', 'http://127.0.0.1:3100');
    vi.stubEnv('BACKEND_URL', 'http://127.0.0.1:3101');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 401 })));

    const response = await GET(new NextRequest('http://127.0.0.1:3100/api/auth/session', {
      headers: { cookie: 'crf_session=forged-token' },
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ authenticated: false });
    expect(response.cookies.get('crf_session')?.maxAge).toBe(0);
  });

  it('returns a user session only after backend verification', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW * 1000);
    vi.stubEnv('APP_ORIGIN', 'http://127.0.0.1:3100');
    vi.stubEnv('BACKEND_URL', 'http://127.0.0.1:3101');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({
      role: 'user',
      rut: '12345678-5',
      expires_at: NOW + 900,
    })));

    const response = await GET(new NextRequest('http://127.0.0.1:3100/api/auth/session', {
      headers: { cookie: 'crf_session=valid-token' },
    }));

    await expect(response.json()).resolves.toEqual({
      authenticated: true,
      role: 'user',
      rut: '12345678-5',
    });
  });

  it.each([
    Response.json({ role: 'admin', expires_at: NOW + 900, internal: true }),
    Response.json({ status: 'error' }, { status: 500 }),
    new Response('invalid-json', { headers: { 'content-type': 'application/json' } }),
  ])('fails safely for an unusable backend session response %#', async (upstreamResponse) => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW * 1000);
    vi.stubEnv('APP_ORIGIN', 'http://127.0.0.1:3100');
    vi.stubEnv('BACKEND_URL', 'http://127.0.0.1:3101');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(upstreamResponse));

    const response = await GET(new NextRequest('http://127.0.0.1:3100/api/auth/session', {
      headers: { cookie: 'crf_session=token' },
    }));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ status: 'error', code: 'AUTH_UPSTREAM_ERROR' });
  });

  it('fails closed when authentication configuration is absent', async () => {
    vi.stubEnv('APP_ORIGIN', '');
    vi.stubEnv('BACKEND_URL', 'http://127.0.0.1:3101');

    const response = await GET(new NextRequest('http://127.0.0.1:3100/api/auth/session'));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ status: 'error', code: 'AUTH_CONFIG_ERROR' });
  });
});
