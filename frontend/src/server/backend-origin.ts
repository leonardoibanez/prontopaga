import 'server-only';
import { parseAbsoluteHttpOrigin } from '@/server/http-origin';

const INVALID_BACKEND_CONFIGURATION = 'Invalid backend configuration';

export function getBackendOrigin(value = process.env.BACKEND_URL): string {
  return parseAbsoluteHttpOrigin(value, INVALID_BACKEND_CONFIGURATION);
}
