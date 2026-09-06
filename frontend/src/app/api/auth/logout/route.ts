import { NextRequest } from 'next/server';
import { getAppOrigin, hasTrustedOrigin, isHttpsOrigin } from '@/server/app-origin';
import { jsonNoStore, safeError } from '@/server/bff';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '@/server/session-cookie';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let appOrigin: string;
  try {
    appOrigin = process.env.APP_ORIGIN ? getAppOrigin() : new URL(request.url).origin;
  } catch {
    return safeError(500, 'AUTH_CONFIG_ERROR');
  }

  if (!hasTrustedOrigin(request, appOrigin)) {
    return safeError(403, 'AUTH_ORIGIN_DENIED');
  }

  const response = jsonNoStore({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, '', sessionCookieOptions(isHttpsOrigin(appOrigin), 0));
  return response;
}
