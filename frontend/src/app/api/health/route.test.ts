// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

const HEALTHY_PAYLOAD = {
  status: 'ok',
  service: 'Consulta Riesgo Financiero',
  timestamp: '2026-09-05T00:00:00.000Z',
};

function expectNoStore(response: Response) {
  expect(response.headers.get('cache-control')).toBe('no-store');
}

describe('GET /api/health', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('forwards only the canonical health path and preserves a valid payload', async () => {
    vi.stubEnv('BACKEND_URL', 'http://127.0.0.1:3101');
    const upstreamFetch = vi.fn().mockResolvedValue(Response.json(HEALTHY_PAYLOAD));
    vi.stubGlobal('fetch', upstreamFetch);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(HEALTHY_PAYLOAD);
    expect(upstreamFetch).toHaveBeenCalledWith(
      'http://127.0.0.1:3101/api/health',
      expect.objectContaining({ cache: 'no-store', redirect: 'error' }),
    );
    expectNoStore(response);
  });

  it('returns a safe configuration error without an upstream request', async () => {
    vi.stubEnv('BACKEND_URL', 'https://api.example.test/api');
    const upstreamFetch = vi.fn();
    vi.stubGlobal('fetch', upstreamFetch);

    const response = await GET();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ status: 'error', code: 'HEALTH_CONFIG_ERROR' });
    expect(response.statusText).not.toContain('api.example.test');
    expect(upstreamFetch).not.toHaveBeenCalled();
    expectNoStore(response);
  });

  it.each([
    Response.json({ status: 'error' }, { status: 503 }),
    new Response('not JSON', { status: 200 }),
    Response.json({ status: 'ok', service: '', timestamp: 'not-a-date' }),
  ])('maps invalid upstream responses to a safe 502', async (upstreamResponse) => {
    vi.stubEnv('BACKEND_URL', 'https://api.example.test');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(upstreamResponse));

    const response = await GET();

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ status: 'error', code: 'HEALTH_UPSTREAM_ERROR' });
    expectNoStore(response);
  });

  it('aborts a slow upstream request after eight seconds with a safe 504', async () => {
    vi.useFakeTimers();
    vi.stubEnv('BACKEND_URL', 'https://api.example.test');
    vi.stubGlobal('fetch', vi.fn((_url: string, options: RequestInit) => new Promise((_, reject) => {
      options.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    })));

    const responsePromise = GET();
    await vi.advanceTimersByTimeAsync(8_000);
    const response = await responsePromise;

    expect(response.status).toBe(504);
    await expect(response.json()).resolves.toEqual({ status: 'error', code: 'HEALTH_UPSTREAM_TIMEOUT' });
    expectNoStore(response);
  });
});
