// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

describe('POST /api/auth/logout', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('clears the session cookie for a trusted origin', async () => {
    vi.stubEnv('APP_ORIGIN', 'http://127.0.0.1:3100');
    const response = await POST(new NextRequest('http://127.0.0.1:3100/api/auth/logout', {
      method: 'POST',
      headers: { origin: 'http://127.0.0.1:3100' },
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(response.cookies.get('crf_session')?.value).toBe('');
    expect(response.cookies.get('crf_session')?.maxAge).toBe(0);
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('rejects a cross-origin logout', async () => {
    vi.stubEnv('APP_ORIGIN', 'http://127.0.0.1:3100');
    const response = await POST(new NextRequest('http://127.0.0.1:3100/api/auth/logout', {
      method: 'POST',
      headers: { origin: 'https://evil.test' },
    }));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ status: 'error', code: 'AUTH_ORIGIN_DENIED' });
  });

  it('fails closed without an explicit application origin', async () => {
    vi.stubEnv('APP_ORIGIN', '');
    const response = await POST(new NextRequest('http://127.0.0.1:3100/api/auth/logout', {
      method: 'POST',
      headers: { origin: 'http://127.0.0.1:3100' },
    }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ status: 'error', code: 'AUTH_CONFIG_ERROR' });
  });

  it('uses a Secure deletion cookie for an HTTPS application', async () => {
    vi.stubEnv('APP_ORIGIN', 'https://app.example.test');
    const response = await POST(new NextRequest('https://app.example.test/api/auth/logout', {
      method: 'POST',
      headers: { origin: 'https://app.example.test' },
    }));

    expect(response.status).toBe(200);
    expect(response.cookies.get('crf_session')?.secure).toBe(true);
  });
});
