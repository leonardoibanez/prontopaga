import { getBackendOrigin } from '@/server/backend-origin';
import { fetchUpstreamJson, jsonNoStore, safeError } from '@/server/bff';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type HealthPayload = {
  status: 'ok';
  service: string;
  timestamp: string;
};

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

  const upstream = await fetchUpstreamJson(`${origin}/api/health`);
  if (upstream.kind === 'timeout') return safeError(504, 'HEALTH_UPSTREAM_TIMEOUT');
  if (upstream.kind !== 'response' || !upstream.ok) return safeError(502, 'HEALTH_UPSTREAM_ERROR');
  if (!isHealthPayload(upstream.payload)) return safeError(502, 'HEALTH_UPSTREAM_ERROR');
  const { status, service, timestamp } = upstream.payload;
  return jsonNoStore({ status, service, timestamp });
}
