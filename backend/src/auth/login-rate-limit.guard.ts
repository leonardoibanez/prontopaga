import { Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { clientAddress, denyRateLimit, RATE_LIMIT_WINDOW_MS } from '../security/rate-limit';
import { RateLimitService } from '../security/rate-limit.service';

type LoginRequest = {
  readonly ip?: string;
  readonly socket?: { readonly remoteAddress?: string };
  readonly body?: { readonly username?: unknown };
};

@Injectable()
export class LoginRateLimitGuard implements CanActivate {
  constructor(private readonly rateLimits: RateLimitService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<LoginRequest>();
    const response = context.switchToHttp().getResponse<{ setHeader(name: string, value: string): void }>();
    const address = clientAddress(request);
    const username = typeof request.body?.username === 'string'
      ? request.body.username.toLowerCase()
      : 'invalid';
    const withinIpLimit = this.rateLimits.consume(`login:ip:${address}`, 30, RATE_LIMIT_WINDOW_MS);
    const withinAccountLimit = this.rateLimits.consume(
      `login:account:${address}:${username}`,
      10,
      RATE_LIMIT_WINDOW_MS,
    );
    if (!withinIpLimit || !withinAccountLimit) denyRateLimit(response);
    return true;
  }
}
