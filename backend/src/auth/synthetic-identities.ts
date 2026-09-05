import type { SyntheticIdentity } from './auth.types';

export const SYNTHETIC_IDENTITIES: readonly SyntheticIdentity[] = Object.freeze([
  Object.freeze({
    sub: 'synthetic-admin-001',
    username: 'demo.admin',
    password: 'AdminDemo!2026',
    role: 'admin',
  }),
  Object.freeze({
    sub: 'synthetic-user-001',
    username: 'demo.user1',
    password: 'UserOneDemo!2026',
    role: 'user',
    rut: '12345678-5',
  }),
  Object.freeze({
    sub: 'synthetic-user-002',
    username: 'demo.user2',
    password: 'UserTwoDemo!2026',
    role: 'user',
    rut: '9876543-3',
  }),
]);
