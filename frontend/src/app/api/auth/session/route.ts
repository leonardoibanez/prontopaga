import { NextRequest } from 'next/server';
import { parseAccessToken, toPublicSession } from '@/server/access-token';
import { getAppOrigin, isHttpsOrigin } from '@/server/app-origin';
import { jsonNoStore } from '@/server/bff';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '@/server/session-cookie';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function unauthenticated(secure: boolean) {
  const response = jsonNoStore({ authenticated: false });
  response.cookies.set(SESSION_COOKIE_NAME, '', sessionCookieOptions(secure, 0));
  return response;
}

export async function GET(request: NextRequest) {
  let secure = false;
  try {
    secure = isHttpsOrigin(process.env.APP_ORIGIN ? getAppOrigin() : new URL(request.url).origin);
  } catch {
    secure = false;
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return jsonNoStore({ authenticated: false });
  }

  const claims = parseAccessToken(token);
  if (claims === null) {
    return unauthenticated(secure);
  }

  return jsonNoStore({ authenticated: true, ...toPublicSession(claims) });
}
