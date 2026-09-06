// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

const NOW = 1_800_000_000;

function jwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.signature`;
}

function loginRequest(origin: string, body: unknown) {
  return new NextRequest('http://127.0.0.1:3100/api/auth/login', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/login', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('sets an HttpOnly session cookie and returns the public session without the token', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW * 1000);
    vi.stubEnv('BACKEND_URL', 'http://127.0.0.1:3101');
    vi.stubEnv('APP_ORIGIN', 'http://127.0.0.1:3100');
    const token = jwt({ role: 'user', rut: '12345678-5', exp: NOW + 900 });
    const upstreamFetch = vi.fn().mockResolvedValue(Response.json({
      access_token: token,
      token_type: 'Bearer',
      expires_in: 900,
    }));
    vi.stubGlobal('fetch', upstreamFetch);

    const response = await POST(loginRequest('http://127.0.0.1:3100', {
      username: 'demo.user1',
      password: 'UserOneDemo!2026',
    }));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ role: 'user', rut: '12345678-5' });
    expect(JSON.stringify(body)).not.toContain(token);
    const cookie = response.cookies.get('crf_session');
    expect(cookie?.value).toBe(token);
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe('lax');
    expect(cookie?.secure).toBe(false);
    expect(cookie?.path).toBe('/');
    expect(cookie?.maxAge).toBe(900);
    expect(upstreamFetch).toHaveBeenCalledWith(
      'http://127.0.0.1:3101/login',
      expect.objectContaining({ method: 'POST', cache: 'no-store', redirect: 'error' }),
    );
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('rejects a cross-origin mutation without calling the backend', async () => {
    vi.stubEnv('BACKEND_URL', 'http://127.0.0.1:3101');
    vi.stubEnv('APP_ORIGIN', 'http://127.0.0.1:3100');
    const upstreamFetch = vi.fn();
    vi.stubGlobal('fetch', upstreamFetch);

    const response = await POST(loginRequest('https://evil.test', {
      username: 'demo.user1',
      password: 'UserOneDemo!2026',
    }));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ status: 'error', code: 'AUTH_ORIGIN_DENIED' });
    expect(upstreamFetch).not.toHaveBeenCalled();
  });

  it('returns a generic credential error for upstream 401', async () => {
    vi.stubEnv('BACKEND_URL', 'http://127.0.0.1:3101');
    vi.stubEnv('APP_ORIGIN', 'http://127.0.0.1:3100');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Unauthorized', { status: 401 })));

    const response = await POST(loginRequest('http://127.0.0.1:3100', {
      username: 'demo.user1',
      password: 'WrongPass!2026',
    }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ status: 'error', code: 'LOGIN_INVALID_CREDENTIALS' });
  });
});
