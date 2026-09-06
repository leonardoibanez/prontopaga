import 'server-only';
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';

export const UPSTREAM_TIMEOUT_MS = 8_000;
export const UPSTREAM_BODY_LIMIT_BYTES = 64 * 1024;
export const REQUEST_BODY_LIMIT_BYTES = 16 * 1024;
export const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };

export function jsonNoStore(body: unknown, init?: { status?: number }) {
  return NextResponse.json(body, { status: init?.status ?? 200, headers: NO_STORE_HEADERS });
}

export function safeError(status: number, code: string) {
  return jsonNoStore({ status: 'error', code }, { status });
}

type JsonReadResult = { kind: 'ok'; payload: unknown } | { kind: 'invalid' } | { kind: 'too_large' };

export type UpstreamJsonResult =
  | { kind: 'response'; status: number; ok: boolean; payload: unknown }
  | { kind: 'timeout' }
  | { kind: 'error' }
  | { kind: 'invalid' }
  | { kind: 'too_large' };

function isJsonContentType(value: string | null): boolean {
  if (value === null) return false;
  const mediaType = value.split(';', 1)[0].trim().toLowerCase();
  return mediaType === 'application/json' || mediaType.endsWith('+json');
}

async function readJsonStream(
  body: ReadableStream<Uint8Array> | null,
  contentLength: string | null,
  limitBytes: number,
): Promise<JsonReadResult> {
  const advertisedLength = contentLength === null ? null : Number(contentLength);
  if (advertisedLength !== null && Number.isFinite(advertisedLength) && advertisedLength > limitBytes) {
    await body?.cancel();
    return { kind: 'too_large' };
  }
  if (body === null) return { kind: 'invalid' };

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > limitBytes) {
      await reader.cancel();
      return { kind: 'too_large' };
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return { kind: 'ok', payload: JSON.parse(new TextDecoder().decode(bytes)) as unknown };
  } catch {
    return { kind: 'invalid' };
  }
}

export async function readJsonRequest(request: Request): Promise<JsonReadResult> {
  if (!isJsonContentType(request.headers.get('content-type'))) return { kind: 'invalid' };
  return readJsonStream(
    request.body,
    request.headers.get('content-length'),
    REQUEST_BODY_LIMIT_BYTES,
  );
}

export async function fetchUpstreamJson(
  url: string,
  init: RequestInit = {},
): Promise<UpstreamJsonResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  const headers = new Headers(init.headers);
  if (!headers.has('x-request-id')) headers.set('x-request-id', randomUUID());

  try {
    const response = await fetch(url, {
      ...init,
      headers,
      cache: 'no-store',
      redirect: 'error',
      signal: controller.signal,
    });
    if (!response.ok) {
      await response.body?.cancel();
      return { kind: 'response', status: response.status, ok: false, payload: null };
    }
    if (!isJsonContentType(response.headers.get('content-type'))) {
      await response.body?.cancel();
      return { kind: 'invalid' };
    }
    const body = await readJsonStream(
      response.body,
      response.headers.get('content-length'),
      UPSTREAM_BODY_LIMIT_BYTES,
    );
    if (body.kind !== 'ok') return body;
    return { kind: 'response', status: response.status, ok: true, payload: body.payload };
  } catch {
    return controller.signal.aborted ? { kind: 'timeout' } : { kind: 'error' };
  } finally {
    clearTimeout(timeout);
  }
}
