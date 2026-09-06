import { Controller, Get, Header, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import type { AuthenticatedPrincipal } from './auth.types';

type AuthenticatedRequest = {
  readonly user: AuthenticatedPrincipal;
  readonly tokenExpiresAt: number;
};

@Controller('me')
@UseGuards(AuthGuard)
export class SessionController {
  @Get()
  @Header('Cache-Control', 'no-store')
  getSession(@Req() request: AuthenticatedRequest) {
    const { user, tokenExpiresAt } = request;
    return user.role === 'user'
      ? { role: 'user' as const, rut: user.rut, expires_at: tokenExpiresAt }
      : { role: 'admin' as const, expires_at: tokenExpiresAt };
  }
}
