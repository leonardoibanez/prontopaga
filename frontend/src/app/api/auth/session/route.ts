import { NextRequest } from 'next/server';
import { parseVerifiedSession, toPublicSession } from '@/server/verified-session';
import { getAppOrigin, isHttpsOrigin } from '@/server/app-origin';
import { getBackendOrigin } from '@/server/backend-origin';
import { fetchUpstreamJson, jsonNoStore, safeError } from '@/server/bff';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '@/server/session-cookie';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function unauthenticated(secure: boolean) {
  const response = jsonNoStore({ authenticated: false });
  response.cookies.set(SESSION_COOKIE_NAME, '', sessionCookieOptions(secure, 0));
  return response;
}

export async function GET(request: NextRequest) {
  let secure: boolean;
  let backendOrigin: string;
  try {
    secure = isHttpsOrigin(getAppOrigin());
    backendOrigin = getBackendOrigin();
  } catch {
    return safeError(500, 'AUTH_CONFIG_ERROR');
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return jsonNoStore({ authenticated: false });
  }

  const upstream = await fetchUpstreamJson(`${backendOrigin}/me`, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (upstream.kind === 'timeout') return safeError(504, 'AUTH_UPSTREAM_TIMEOUT');
  if (upstream.kind !== 'response') return safeError(502, 'AUTH_UPSTREAM_ERROR');
  if (upstream.status === 401) {
    return unauthenticated(secure);
  }
  if (!upstream.ok) return safeError(502, 'AUTH_UPSTREAM_ERROR');

  const session = parseVerifiedSession(upstream.payload);
  if (session === null) return safeError(502, 'AUTH_UPSTREAM_ERROR');
  return jsonNoStore({ authenticated: true, ...toPublicSession(session) });
}
