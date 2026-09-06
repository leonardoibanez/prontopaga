import { NextRequest } from 'next/server';
import { cookieMaxAge, parseVerifiedSession, toPublicSession } from '@/server/verified-session';
import { getAppOrigin, hasTrustedOrigin, isHttpsOrigin } from '@/server/app-origin';
import { getBackendOrigin } from '@/server/backend-origin';
import { fetchUpstreamJson, jsonNoStore, readJsonRequest, safeError } from '@/server/bff';
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
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const login = payload as Record<string, unknown>;
  return Object.keys(login).length === 3
    && typeof login.access_token === 'string'
    && login.access_token.length > 0
    && login.token_type === 'Bearer'
    && typeof login.expires_in === 'number'
    && Number.isInteger(login.expires_in)
    && login.expires_in > 0
    && login.expires_in <= 900;
}

export async function POST(request: NextRequest) {
  let appOrigin: string;
  let backendOrigin: string;
  try {
    appOrigin = getAppOrigin();
    backendOrigin = getBackendOrigin();
  } catch {
    return safeError(500, 'AUTH_CONFIG_ERROR');
  }

  if (!hasTrustedOrigin(request, appOrigin)) {
    return safeError(403, 'AUTH_ORIGIN_DENIED');
  }

  let requestBody: Awaited<ReturnType<typeof readJsonRequest>>;
  try {
    requestBody = await readJsonRequest(request);
  } catch {
    return safeError(400, 'LOGIN_INVALID_REQUEST');
  }
  if (requestBody.kind === 'too_large') return safeError(413, 'LOGIN_REQUEST_TOO_LARGE');
  if (requestBody.kind !== 'ok') return safeError(400, 'LOGIN_INVALID_REQUEST');

  const credentials = readCredentials(requestBody.payload);
  if (credentials === null) {
    return safeError(400, 'LOGIN_INVALID_REQUEST');
  }

  const upstream = await fetchUpstreamJson(`${backendOrigin}/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (upstream.kind === 'timeout') return safeError(504, 'LOGIN_UPSTREAM_TIMEOUT');
  if (upstream.kind !== 'response') return safeError(502, 'LOGIN_UPSTREAM_ERROR');

  if (upstream.status === 401) return safeError(401, 'LOGIN_INVALID_CREDENTIALS');
  if (upstream.status === 400) return safeError(400, 'LOGIN_INVALID_REQUEST');
  if (upstream.status === 429) return safeError(429, 'LOGIN_RATE_LIMITED');
  if (!upstream.ok || !isLoginPayload(upstream.payload)) return safeError(502, 'LOGIN_UPSTREAM_ERROR');

  const payload = upstream.payload;
  const verified = await fetchUpstreamJson(`${backendOrigin}/me`, {
    headers: { authorization: `Bearer ${payload.access_token}` },
  });
  if (verified.kind === 'timeout') return safeError(504, 'LOGIN_UPSTREAM_TIMEOUT');
  if (verified.kind !== 'response' || !verified.ok) return safeError(502, 'LOGIN_UPSTREAM_ERROR');

  const session = parseVerifiedSession(verified.payload);
  if (session === null) return safeError(502, 'LOGIN_UPSTREAM_ERROR');

  const response = jsonNoStore(toPublicSession(session));
  response.cookies.set(
    SESSION_COOKIE_NAME,
    payload.access_token,
    sessionCookieOptions(isHttpsOrigin(appOrigin), cookieMaxAge(payload.expires_in, session.expiresAt)),
  );
  return response;
}
