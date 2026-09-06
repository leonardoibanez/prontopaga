// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { cookieMaxAge, parseVerifiedSession, toPublicSession } from './verified-session';

describe('parseVerifiedSession', () => {
  const now = 1_800_000_000;

  it('accepts only strict backend-verified session contracts', () => {
    expect(parseVerifiedSession({ role: 'admin', expires_at: now + 900 }, now)).toEqual({
      role: 'admin',
      expiresAt: now + 900,
    });
    expect(parseVerifiedSession({ role: 'user', rut: '12345678-5', expires_at: now + 900 }, now)).toEqual({
      role: 'user',
      rut: '12345678-5',
      expiresAt: now + 900,
    });
  });

  it.each([
    { role: 'admin', expires_at: now },
    { role: 'admin', expires_at: now + 906 },
    { role: 'admin', rut: '12345678-5', expires_at: now + 900 },
    { role: 'user', expires_at: now + 900 },
    { role: 'user', rut: '', expires_at: now + 900 },
    { role: 'guest', expires_at: now + 900 },
  ])('rejects unverified or malformed session payloads %#', (payload) => {
    expect(parseVerifiedSession(payload, now)).toBeNull();
  });
});

describe('session projection', () => {
  it('never outlives the verified token and omits expiry from the browser response', () => {
    expect(cookieMaxAge(900, 1_800_000_900, 1_800_000_000)).toBe(900);
    expect(cookieMaxAge(1200, 1_800_000_200, 1_800_000_000)).toBe(200);
    expect(toPublicSession({ role: 'user', rut: '12345678-5', expiresAt: 1 })).toEqual({
      role: 'user',
      rut: '12345678-5',
    });
  });
});
