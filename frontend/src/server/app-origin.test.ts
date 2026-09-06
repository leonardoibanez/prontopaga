// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { getAppOrigin, hasTrustedOrigin, isHttpsOrigin } from './app-origin';

describe('getAppOrigin', () => {
  it('normalizes a valid absolute HTTP(S) origin', () => {
    expect(getAppOrigin('https://app.example.test')).toBe('https://app.example.test');
    expect(getAppOrigin('http://127.0.0.1:3100/')).toBe('http://127.0.0.1:3100');
  });

  it.each([
    undefined,
    '',
    '/login',
    'ftp://app.example.test',
    'https://user:password@app.example.test',
    'https://app.example.test?debug=true',
    'https://app.example.test#fragment',
    'https://app.example.test/app',
  ])('rejects unsafe application origin %#', (value) => {
    expect(() => getAppOrigin(value)).toThrow('Invalid application origin');
  });
});

describe('origin helpers', () => {
  it('detects https origins and trusted mutation origins', () => {
    expect(isHttpsOrigin('https://app.example.test')).toBe(true);
    expect(isHttpsOrigin('http://127.0.0.1:3100')).toBe(false);
    expect(hasTrustedOrigin(
      new Request('http://127.0.0.1:3100/api/auth/login', { headers: { origin: 'http://127.0.0.1:3100' } }),
      'http://127.0.0.1:3100',
    )).toBe(true);
    expect(hasTrustedOrigin(
      new Request('http://127.0.0.1:3100/api/auth/login', { headers: { origin: 'https://evil.test' } }),
      'http://127.0.0.1:3100',
    )).toBe(false);
    expect(hasTrustedOrigin(new Request('http://127.0.0.1:3100/api/auth/login'), 'http://127.0.0.1:3100')).toBe(false);
  });
});
