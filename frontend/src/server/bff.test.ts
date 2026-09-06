// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchUpstreamJson, readJsonRequest, UPSTREAM_BODY_LIMIT_BYTES } from './bff';

describe('BFF body and deadline controls', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('rejects non-JSON and oversized browser requests before parsing', async () => {
    await expect(readJsonRequest(new Request('https://app.example.test/login', {
      method: 'POST',
      body: 'plain text',
    }))).resolves.toEqual({ kind: 'invalid' });

    await expect(readJsonRequest(new Request('https://app.example.test/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'content-length': String(17 * 1024),
      },
      body: '{}',
    }))).resolves.toEqual({ kind: 'too_large' });
  });

  it('keeps the deadline active while the upstream body is stalled', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn((_url: string, init: RequestInit) => {
      const body = new ReadableStream<Uint8Array>({
        start(controller) {
          init.signal?.addEventListener('abort', () => {
            controller.error(new DOMException('Aborted', 'AbortError'));
          });
        },
      });
      return Promise.resolve(new Response(body, { headers: { 'content-type': 'application/json' } }));
    }));

    const resultPromise = fetchUpstreamJson('https://api.example.test/data');
    await vi.advanceTimersByTimeAsync(8_000);

    await expect(resultPromise).resolves.toEqual({ kind: 'timeout' });
  });

  it('rejects oversized and malformed upstream JSON', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response('{}', {
        headers: {
          'content-type': 'application/json',
          'content-length': String(UPSTREAM_BODY_LIMIT_BYTES + 1),
        },
      }))
      .mockResolvedValueOnce(new Response('{', {
        headers: { 'content-type': 'application/json' },
      })));

    await expect(fetchUpstreamJson('https://api.example.test/large')).resolves.toEqual({ kind: 'too_large' });
    await expect(fetchUpstreamJson('https://api.example.test/invalid')).resolves.toEqual({ kind: 'invalid' });
  });
});
