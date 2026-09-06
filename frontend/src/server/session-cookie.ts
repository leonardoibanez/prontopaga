import 'server-only';

export const SESSION_COOKIE_NAME = 'crf_session';
export const SESSION_MAX_AGE_SECONDS = 900;

export function sessionCookieOptions(secure: boolean, maxAge: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure,
    path: '/',
    maxAge,
  };
}
