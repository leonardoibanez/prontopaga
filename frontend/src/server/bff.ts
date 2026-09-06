import 'server-only';
import { NextResponse } from 'next/server';

export const UPSTREAM_TIMEOUT_MS = 8_000;
export const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };

export function jsonNoStore(body: unknown, init?: { status?: number }) {
  return NextResponse.json(body, { status: init?.status ?? 200, headers: NO_STORE_HEADERS });
}

export function safeError(status: number, code: string) {
  return jsonNoStore({ status: 'error', code }, { status });
}

export async function fetchUpstream(url: string, init: RequestInit = {}): Promise<
  { kind: 'ok'; response: Response } | { kind: 'timeout' } | { kind: 'error' }
> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...init,
      cache: 'no-store',
      redirect: 'error',
      signal: controller.signal,
    });
    return { kind: 'ok', response };
  } catch {
    return controller.signal.aborted ? { kind: 'timeout' } : { kind: 'error' };
  } finally {
    clearTimeout(timeout);
  }
}
