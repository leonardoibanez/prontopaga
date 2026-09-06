// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { cookieMaxAge, parseAccessToken, toPublicSession } from './access-token';

function jwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.signature`;
}

describe('parseAccessToken', () => {
  const now = 1_800_000_000;

  it('reads a user principal and an administrator principal', () => {
    expect(parseAccessToken(jwt({ role: 'user', rut: '12345678-5', exp: now + 900 }), now)).toEqual({
      role: 'user',
      rut: '12345678-5',
      exp: now + 900,
    });
    expect(parseAccessToken(jwt({ role: 'admin', exp: now + 900 }), now)).toEqual({
      role: 'admin',
      exp: now + 900,
    });
  });

  it.each([
    'not-a-jwt',
    jwt({ role: 'user', exp: 1_800_000_000 + 900 }),
    jwt({ role: 'user', rut: '', exp: 1_800_000_000 + 900 }),
    jwt({ role: 'user', rut: '12345678-5', exp: 1_800_000_000 }),
    jwt({ role: 'guest', exp: 1_800_000_000 + 900 }),
  ])('rejects unusable tokens %#', (token) => {
    expect(parseAccessToken(token, now)).toBeNull();
  });
});

describe('cookieMaxAge', () => {
  it('never outlives the token or the 900-second cap', () => {
    expect(cookieMaxAge(900, 1_800_000_900, 1_800_000_000)).toBe(900);
    expect(cookieMaxAge(1200, 1_800_000_200, 1_800_000_000)).toBe(200);
    expect(cookieMaxAge('900', 1_800_000_050, 1_800_000_000)).toBe(50);
  });
});

describe('toPublicSession', () => {
  it('omits expiry from the browser session', () => {
    expect(toPublicSession({ role: 'admin', exp: 1 })).toEqual({ role: 'admin' });
    expect(toPublicSession({ role: 'user', rut: '12345678-5', exp: 1 })).toEqual({
      role: 'user',
      rut: '12345678-5',
    });
  });
});
