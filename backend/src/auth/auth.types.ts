export const ACCESS_TOKEN_SECONDS = 900 as const;

export type AuthenticatedPrincipal =
  | { readonly sub: string; readonly role: 'admin' }
  | { readonly sub: string; readonly role: 'user'; readonly rut: string };

export interface LoginResponse {
  readonly access_token: string;
  readonly token_type: 'Bearer';
  readonly expires_in: typeof ACCESS_TOKEN_SECONDS;
}

export interface SyntheticAdministrator {
  readonly sub: string;
  readonly username: string;
  readonly password: string;
  readonly role: 'admin';
}

export interface SyntheticUser {
  readonly sub: string;
  readonly username: string;
  readonly password: string;
  readonly role: 'user';
  readonly rut: string;
}

export type SyntheticIdentity = SyntheticAdministrator | SyntheticUser;

export const SYNTHETIC_IDENTITIES = Symbol('SYNTHETIC_IDENTITIES');
