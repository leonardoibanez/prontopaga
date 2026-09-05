import { NextResponse } from 'next/server';
import { getBackendOrigin } from '@/server/backend-origin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TIMEOUT_MS = 8_000;
const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };

type HealthPayload = {
  status: 'ok';
  service: string;
  timestamp: string;
};

function safeError(status: number, code: string) {
  return NextResponse.json({ status: 'error', code }, { status, headers: NO_STORE_HEADERS });
}

function isHealthPayload(payload: unknown): payload is HealthPayload {
  if (!payload || typeof payload !== 'object') return false;

  const health = payload as Record<string, unknown>;
  return health.status === 'ok'
    && typeof health.service === 'string'
    && health.service.trim().length > 0
    && typeof health.timestamp === 'string'
    && !Number.isNaN(Date.parse(health.timestamp));
}

export async function GET() {
  let origin: string;
  try {
    origin = getBackendOrigin();
  } catch {
    return safeError(500, 'HEALTH_CONFIG_ERROR');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const upstreamResponse = await fetch(`${origin}/api/health`, {
      cache: 'no-store',
      redirect: 'error',
      signal: controller.signal,
    });
    if (!upstreamResponse.ok) return safeError(502, 'HEALTH_UPSTREAM_ERROR');

    const payload: unknown = await upstreamResponse.json();
    if (!isHealthPayload(payload)) return safeError(502, 'HEALTH_UPSTREAM_ERROR');

    return NextResponse.json(payload, { headers: NO_STORE_HEADERS });
  } catch {
    return controller.signal.aborted
      ? safeError(504, 'HEALTH_UPSTREAM_TIMEOUT')
      : safeError(502, 'HEALTH_UPSTREAM_ERROR');
  } finally {
    clearTimeout(timeout);
  }
}
