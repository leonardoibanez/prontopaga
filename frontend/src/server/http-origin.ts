import 'server-only';

export function parseAbsoluteHttpOrigin(value: string | undefined, message: string): string {
  if (!value || value.trim() !== value) {
    throw new Error(message);
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(message);
  }

  const hasUnsafeParts = url.username
    || url.password
    || url.search
    || url.hash
    || url.pathname !== '/';
  if (!url.hostname || !['http:', 'https:'].includes(url.protocol) || hasUnsafeParts) {
    throw new Error(message);
  }

  return url.origin;
}
