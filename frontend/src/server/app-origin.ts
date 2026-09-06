import 'server-only';
import { parseAbsoluteHttpOrigin } from '@/server/http-origin';

const INVALID_APPLICATION_ORIGIN = 'Invalid application origin';

export function getAppOrigin(value = process.env.APP_ORIGIN): string {
  return parseAbsoluteHttpOrigin(value, INVALID_APPLICATION_ORIGIN);
}

export function isHttpsOrigin(origin: string): boolean {
  return origin.startsWith('https:');
}

export function hasTrustedOrigin(request: Request, trustedOrigin: string): boolean {
  return request.headers.get('origin') === trustedOrigin;
}
