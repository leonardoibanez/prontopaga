import 'server-only';
import type { PublicSession } from '@/lib/session';

export type AccessTokenClaims = PublicSession & { readonly exp: number };

export function parseAccessToken(token: string, nowSeconds = Math.floor(Date.now() / 1000)): AccessTokenClaims | null {
  const parts = token.split('.');
  if (parts.length !== 3 || parts.some((part) => part.length === 0)) return null;

  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as Record<string, unknown>;
    const { role, rut, exp } = payload;
    if ((role !== 'admin' && role !== 'user') || typeof exp !== 'number' || !Number.isInteger(exp) || exp <= nowSeconds) {
      return null;
    }
    if (role === 'user') {
      if (typeof rut !== 'string' || rut.length === 0) return null;
      return { role, rut, exp };
    }
    return { role, exp };
  } catch {
    return null;
  }
}

export function cookieMaxAge(expiresIn: unknown, exp: number, nowSeconds = Math.floor(Date.now() / 1000)): number {
  if (typeof expiresIn === 'number' && Number.isInteger(expiresIn) && expiresIn > 0 && expiresIn <= 900) {
    return Math.min(expiresIn, Math.max(1, exp - nowSeconds));
  }
  return Math.min(900, Math.max(1, exp - nowSeconds));
}

export function toPublicSession(claims: AccessTokenClaims): PublicSession {
  return claims.role === 'user' ? { role: 'user', rut: claims.rut } : { role: 'admin' };
}
