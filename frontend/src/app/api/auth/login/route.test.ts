// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

const NOW = 1_800_000_000;

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
    const token = 'backend-signed-access-token';
    const upstreamFetch = vi.fn()
      .mockResolvedValueOnce(Response.json({
        access_token: token,
        token_type: 'Bearer',
        expires_in: 900,
      }))
      .mockResolvedValueOnce(Response.json({
        role: 'user',
        rut: '12345678-5',
        expires_at: NOW + 900,
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
    expect(upstreamFetch).toHaveBeenLastCalledWith(
      'http://127.0.0.1:3101/me',
      expect.objectContaining({ headers: expect.any(Headers) }),
    );
    const verificationHeaders = upstreamFetch.mock.calls[1][1]?.headers as Headers;
    expect(verificationHeaders.get('authorization')).toBe(`Bearer ${token}`);
    expect(verificationHeaders.get('x-request-id')).toBeTruthy();
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

  it('fails closed when APP_ORIGIN is absent', async () => {
    vi.stubEnv('BACKEND_URL', 'http://127.0.0.1:3101');
    vi.stubEnv('APP_ORIGIN', '');
    const upstreamFetch = vi.fn();
    vi.stubGlobal('fetch', upstreamFetch);

    const response = await POST(loginRequest('http://127.0.0.1:3100', {
      username: 'demo.user1',
      password: 'UserOneDemo!2026',
    }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ status: 'error', code: 'AUTH_CONFIG_ERROR' });
    expect(upstreamFetch).not.toHaveBeenCalled();
  });

  it.each([
    [Response.json({ status: 'error' }, { status: 500 }), 'LOGIN_UPSTREAM_ERROR'],
    [new Response('not-json', { headers: { 'content-type': 'application/json' } }), 'LOGIN_UPSTREAM_ERROR'],
    [Response.json({ access_token: 'token', token_type: 'Bearer', expires_in: 901 }), 'LOGIN_UPSTREAM_ERROR'],
  ])('rejects an unusable login upstream response %#', async (upstreamResponse, code) => {
    vi.stubEnv('BACKEND_URL', 'http://127.0.0.1:3101');
    vi.stubEnv('APP_ORIGIN', 'http://127.0.0.1:3100');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(upstreamResponse));

    const response = await POST(loginRequest('http://127.0.0.1:3100', {
      username: 'demo.user1',
      password: 'UserOneDemo!2026',
    }));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ status: 'error', code });
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it.each([
    [400, 400, 'LOGIN_INVALID_REQUEST'],
    [429, 429, 'LOGIN_RATE_LIMITED'],
  ])('preserves actionable upstream status %i', async (upstreamStatus, expectedStatus, code) => {
    vi.stubEnv('BACKEND_URL', 'http://127.0.0.1:3101');
    vi.stubEnv('APP_ORIGIN', 'http://127.0.0.1:3100');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: upstreamStatus })));

    const response = await POST(loginRequest('http://127.0.0.1:3100', {
      username: 'demo.user1',
      password: 'UserOneDemo!2026',
    }));

    expect(response.status).toBe(expectedStatus);
    await expect(response.json()).resolves.toEqual({ status: 'error', code });
  });

  it('rejects an oversized login body before contacting the backend', async () => {
    vi.stubEnv('BACKEND_URL', 'http://127.0.0.1:3101');
    vi.stubEnv('APP_ORIGIN', 'http://127.0.0.1:3100');
    const upstreamFetch = vi.fn();
    vi.stubGlobal('fetch', upstreamFetch);
    const request = new NextRequest('http://127.0.0.1:3100/api/auth/login', {
      method: 'POST',
      headers: {
        origin: 'http://127.0.0.1:3100',
        'content-type': 'application/json',
        'content-length': String(17 * 1024),
      },
      body: '{}',
    });

    const response = await POST(request);

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({ status: 'error', code: 'LOGIN_REQUEST_TOO_LARGE' });
    expect(upstreamFetch).not.toHaveBeenCalled();
  });

  it('requires the backend to verify the newly issued token', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW * 1000);
    vi.stubEnv('BACKEND_URL', 'http://127.0.0.1:3101');
    vi.stubEnv('APP_ORIGIN', 'http://127.0.0.1:3100');
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(Response.json({
        access_token: 'untrusted-token',
        token_type: 'Bearer',
        expires_in: 900,
      }))
      .mockResolvedValueOnce(new Response(null, { status: 401 })));

    const response = await POST(loginRequest('http://127.0.0.1:3100', {
      username: 'demo.user1',
      password: 'UserOneDemo!2026',
    }));

    expect(response.status).toBe(502);
    expect(response.cookies.get('crf_session')).toBeUndefined();
  });
});
