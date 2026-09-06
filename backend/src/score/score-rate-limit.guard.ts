import { Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import type { AuthenticatedPrincipal } from '../auth/auth.types';
import { clientAddress, denyRateLimit, RATE_LIMIT_WINDOW_MS } from '../security/rate-limit';
import { RateLimitService } from '../security/rate-limit.service';

type ScoreRequest = {
  readonly ip?: string;
  readonly socket?: { readonly remoteAddress?: string };
  readonly user: AuthenticatedPrincipal;
};

@Injectable()
export class ScoreRateLimitGuard implements CanActivate {
  constructor(private readonly rateLimits: RateLimitService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<ScoreRequest>();
    const response = context.switchToHttp().getResponse<{ setHeader(name: string, value: string): void }>();
    const address = clientAddress(request);
    const withinIpLimit = this.rateLimits.consume(`score:ip:${address}`, 120, RATE_LIMIT_WINDOW_MS);
    const withinPrincipalLimit = this.rateLimits.consume(
      `score:principal:${request.user.sub}`,
      60,
      RATE_LIMIT_WINDOW_MS,
    );
    if (!withinIpLimit || !withinPrincipalLimit) denyRateLimit(response);
    return true;
  }
}
