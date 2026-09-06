import { NextRequest } from 'next/server';
import { parseAccessToken, cookieMaxAge, toPublicSession } from '@/server/access-token';
import { getAppOrigin, hasTrustedOrigin, isHttpsOrigin } from '@/server/app-origin';
import { getBackendOrigin } from '@/server/backend-origin';
import { fetchUpstream, jsonNoStore, safeError } from '@/server/bff';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '@/server/session-cookie';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type LoginPayload = {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
};

function readCredentials(body: unknown): { username: string; password: string } | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const record = body as Record<string, unknown>;
  const keys = Object.keys(record);
  if (keys.length !== 2 || !keys.includes('username') || !keys.includes('password')) return null;
  const { username, password } = record;
  if (typeof username !== 'string' || typeof password !== 'string') return null;
  if (username.length < 3 || username.length > 64) return null;
  if (password.length < 8 || password.length > 128) return null;
  return { username, password };
}

function isLoginPayload(payload: unknown): payload is LoginPayload {
  if (!payload || typeof payload !== 'object') return false;
  const login = payload as Record<string, unknown>;
  return typeof login.access_token === 'string'
    && login.access_token.length > 0
    && login.token_type === 'Bearer'
    && typeof login.expires_in === 'number'
    && Number.isInteger(login.expires_in);
}

export async function POST(request: NextRequest) {
  let appOrigin: string;
  let backendOrigin: string;
  try {
    appOrigin = process.env.APP_ORIGIN ? getAppOrigin() : new URL(request.url).origin;
    backendOrigin = getBackendOrigin();
  } catch {
    return safeError(500, 'AUTH_CONFIG_ERROR');
  }

  if (!hasTrustedOrigin(request, appOrigin)) {
    return safeError(403, 'AUTH_ORIGIN_DENIED');
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return safeError(400, 'LOGIN_INVALID_REQUEST');
  }

  const credentials = readCredentials(body);
  if (credentials === null) {
    return safeError(400, 'LOGIN_INVALID_REQUEST');
  }

  const upstream = await fetchUpstream(`${backendOrigin}/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (upstream.kind === 'timeout') return safeError(504, 'LOGIN_UPSTREAM_TIMEOUT');
  if (upstream.kind === 'error') return safeError(502, 'LOGIN_UPSTREAM_ERROR');

  if (upstream.response.status === 401) return safeError(401, 'LOGIN_INVALID_CREDENTIALS');
  if (upstream.response.status === 400) return safeError(400, 'LOGIN_INVALID_REQUEST');
  if (!upstream.response.ok) return safeError(502, 'LOGIN_UPSTREAM_ERROR');

  let payload: unknown;
  try {
    payload = await upstream.response.json();
  } catch {
    return safeError(502, 'LOGIN_UPSTREAM_ERROR');
  }

  if (!isLoginPayload(payload)) return safeError(502, 'LOGIN_UPSTREAM_ERROR');

  const claims = parseAccessToken(payload.access_token);
  if (claims === null) return safeError(502, 'LOGIN_UPSTREAM_ERROR');

  const response = jsonNoStore(toPublicSession(claims));
  response.cookies.set(
    SESSION_COOKIE_NAME,
    payload.access_token,
    sessionCookieOptions(isHttpsOrigin(appOrigin), cookieMaxAge(payload.expires_in, claims.exp)),
  );
  return response;
}
