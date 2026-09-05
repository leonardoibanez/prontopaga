// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { getBackendOrigin } from './backend-origin';

describe('getBackendOrigin', () => {
  it('normalizes a valid absolute HTTP(S) origin', () => {
    expect(getBackendOrigin('https://api.example.test')).toBe('https://api.example.test');
    expect(getBackendOrigin('http://localhost:3101/')).toBe('http://localhost:3101');
  });

  it.each([
    undefined,
    '',
    '/api',
    'ftp://api.example.test',
    'https://user:password@api.example.test',
    'https://api.example.test?debug=true',
    'https://api.example.test#fragment',
    'https://api.example.test/api',
    'https://api.example.test/api/',
    'https://api.example.test/health',
  ])('rejects unsafe backend configuration %#', (value) => {
    expect(() => getBackendOrigin(value)).toThrow('Invalid backend configuration');
  });
});
