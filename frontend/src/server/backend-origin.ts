import 'server-only';

const INVALID_BACKEND_CONFIGURATION = 'Invalid backend configuration';

export function getBackendOrigin(value = process.env.BACKEND_URL): string {
  if (!value || value.trim() !== value) {
    throw new Error(INVALID_BACKEND_CONFIGURATION);
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(INVALID_BACKEND_CONFIGURATION);
  }

  const hasUnsafeParts = url.username
    || url.password
    || url.search
    || url.hash
    || url.pathname !== '/';
  if (!url.hostname || !['http:', 'https:'].includes(url.protocol) || hasUnsafeParts) {
    throw new Error(INVALID_BACKEND_CONFIGURATION);
  }

  return url.origin;
}
