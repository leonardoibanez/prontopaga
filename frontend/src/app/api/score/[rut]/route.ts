import { NextRequest } from 'next/server';
import { getBackendOrigin } from '@/server/backend-origin';
import { fetchUpstream, jsonNoStore, safeError } from '@/server/bff';
import { SESSION_COOKIE_NAME } from '@/server/session-cookie';
import type { ScoreConsultation } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ rut: string }> };

function isScoreConsultation(payload: unknown): payload is ScoreConsultation {
  if (!payload || typeof payload !== 'object') return false;
  const score = payload as Record<string, unknown>;
  return typeof score.rut === 'string'
    && score.rut.length > 0
    && typeof score.score === 'number'
    && Number.isInteger(score.score)
    && score.score >= 0
    && score.score <= 100
    && typeof score.fecha === 'string'
    && !Number.isNaN(Date.parse(score.fecha));
}

export async function GET(request: NextRequest, context: RouteContext) {
  let backendOrigin: string;
  try {
    backendOrigin = getBackendOrigin();
  } catch {
    return safeError(500, 'SCORE_CONFIG_ERROR');
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return safeError(401, 'SCORE_UNAUTHENTICATED');
  }

  const { rut } = await context.params;
  const upstream = await fetchUpstream(`${backendOrigin}/score/${encodeURIComponent(rut)}`, {
    headers: { authorization: `Bearer ${token}` },
  });

  if (upstream.kind === 'timeout') return safeError(504, 'SCORE_UPSTREAM_TIMEOUT');
  if (upstream.kind === 'error') return safeError(502, 'SCORE_UPSTREAM_ERROR');

  if (upstream.response.status === 401) return safeError(401, 'SCORE_UNAUTHENTICATED');
  if (upstream.response.status === 403) return safeError(403, 'SCORE_FORBIDDEN');
  if (upstream.response.status === 400) return safeError(400, 'SCORE_INVALID_RUT');
  if (!upstream.response.ok) return safeError(502, 'SCORE_UPSTREAM_ERROR');

  let payload: unknown;
  try {
    payload = await upstream.response.json();
  } catch {
    return safeError(502, 'SCORE_UPSTREAM_ERROR');
  }

  if (!isScoreConsultation(payload)) return safeError(502, 'SCORE_UPSTREAM_ERROR');
  return jsonNoStore(payload);
}
