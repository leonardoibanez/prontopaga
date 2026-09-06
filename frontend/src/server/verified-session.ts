import 'server-only';
import type { PublicSession } from '@/lib/session';

export type VerifiedSession = PublicSession & { readonly expiresAt: number };

export function parseVerifiedSession(
  payload: unknown,
  nowSeconds = Math.floor(Date.now() / 1000),
): VerifiedSession | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const session = payload as Record<string, unknown>;
  const { role, rut, expires_at: expiresAt } = session;
  if (
    typeof expiresAt !== 'number'
    || !Number.isInteger(expiresAt)
    || expiresAt <= nowSeconds
    || expiresAt > nowSeconds + 905
  ) {
    return null;
  }

  if (role === 'admin' && Object.keys(session).length === 2) {
    return { role, expiresAt };
  }
  if (
    role === 'user'
    && typeof rut === 'string'
    && rut.length > 0
    && Object.keys(session).length === 3
  ) {
    return { role, rut, expiresAt };
  }
  return null;
}

export function cookieMaxAge(
  expiresIn: unknown,
  expiresAt: number,
  nowSeconds = Math.floor(Date.now() / 1000),
): number {
  const advertisedLifetime = typeof expiresIn === 'number'
    && Number.isInteger(expiresIn)
    && expiresIn > 0
    && expiresIn <= 900
    ? expiresIn
    : 900;
  return Math.min(advertisedLifetime, Math.max(1, expiresAt - nowSeconds));
}

export function toPublicSession(session: VerifiedSession): PublicSession {
  return session.role === 'user'
    ? { role: 'user', rut: session.rut }
    : { role: 'admin' };
}
