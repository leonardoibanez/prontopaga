import { HttpException, HttpStatus } from '@nestjs/common';

export const RATE_LIMIT_WINDOW_MS = 60_000;

export type RateLimitRequest = {
  readonly ip?: string;
  readonly socket?: { readonly remoteAddress?: string };
};

export type RateLimitResponse = {
  setHeader(name: string, value: string): void;
};

export function clientAddress(request: RateLimitRequest): string {
  return request.ip ?? request.socket?.remoteAddress ?? 'unknown';
}

export function denyRateLimit(response: RateLimitResponse): never {
  response.setHeader('Retry-After', String(RATE_LIMIT_WINDOW_MS / 1000));
  throw new HttpException(
    { statusCode: HttpStatus.TOO_MANY_REQUESTS, message: 'Too Many Requests' },
    HttpStatus.TOO_MANY_REQUESTS,
  );
}
