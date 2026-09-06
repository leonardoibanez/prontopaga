// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';

const NOW = 1_800_000_000;

function jwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.signature`;
}

describe('GET /api/auth/session', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it('returns an unauthenticated session without a cookie', async () => {
    vi.stubEnv('APP_ORIGIN', 'http://127.0.0.1:3100');
    const response = await GET(new NextRequest('http://127.0.0.1:3100/api/auth/session'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ authenticated: false });
  });

  it('returns the public session for a live cookie and never echoes the token', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW * 1000);
    vi.stubEnv('APP_ORIGIN', 'http://127.0.0.1:3100');
    const token = jwt({ role: 'admin', exp: NOW + 900 });
    const response = await GET(new NextRequest('http://127.0.0.1:3100/api/auth/session', {
      headers: { cookie: `crf_session=${token}` },
    }));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ authenticated: true, role: 'admin' });
    expect(JSON.stringify(body)).not.toContain(token);
  });
});
