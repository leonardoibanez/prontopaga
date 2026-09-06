import { NextRequest } from 'next/server';
import { getAppOrigin, isHttpsOrigin } from '@/server/app-origin';
import { getBackendOrigin } from '@/server/backend-origin';
import { fetchUpstreamJson, jsonNoStore, safeError } from '@/server/bff';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '@/server/session-cookie';
import type { ScoreConsultation } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ rut: string }> };

function isScoreConsultation(payload: unknown): payload is ScoreConsultation {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const score = payload as Record<string, unknown>;
  return Object.keys(score).length === 3
    && typeof score.rut === 'string'
    && score.rut.length > 0
    && typeof score.score === 'number'
    && Number.isInteger(score.score)
    && score.score >= 0
    && score.score <= 100
    && typeof score.fecha === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(score.fecha)
    && !Number.isNaN(Date.parse(score.fecha));
}

function unauthenticated(secure: boolean) {
  const response = safeError(401, 'SCORE_UNAUTHENTICATED');
  response.cookies.set(SESSION_COOKIE_NAME, '', sessionCookieOptions(secure, 0));
  return response;
}

export async function GET(request: NextRequest, context: RouteContext) {
  let backendOrigin: string;
  let secure: boolean;
  try {
    backendOrigin = getBackendOrigin();
    secure = isHttpsOrigin(getAppOrigin());
  } catch {
    return safeError(500, 'SCORE_CONFIG_ERROR');
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return safeError(401, 'SCORE_UNAUTHENTICATED');
  }

  const { rut } = await context.params;
  const upstream = await fetchUpstreamJson(`${backendOrigin}/score/${encodeURIComponent(rut)}`, {
    headers: { authorization: `Bearer ${token}` },
  });

  if (upstream.kind === 'timeout') return safeError(504, 'SCORE_UPSTREAM_TIMEOUT');
  if (upstream.kind !== 'response') return safeError(502, 'SCORE_UPSTREAM_ERROR');

  if (upstream.status === 401) return unauthenticated(secure);
  if (upstream.status === 403) return safeError(403, 'SCORE_FORBIDDEN');
  if (upstream.status === 400) return safeError(400, 'SCORE_INVALID_RUT');
  if (upstream.status === 429) return safeError(429, 'SCORE_RATE_LIMITED');
  if (!upstream.ok) return safeError(502, 'SCORE_UPSTREAM_ERROR');

  if (!isScoreConsultation(upstream.payload)) return safeError(502, 'SCORE_UPSTREAM_ERROR');
  const { rut: responseRut, score, fecha } = upstream.payload;
  return jsonNoStore({ rut: responseRut, score, fecha });
}
