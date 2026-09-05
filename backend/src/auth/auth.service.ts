import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ACCESS_TOKEN_SECONDS,
  SYNTHETIC_IDENTITIES,
  type LoginResponse,
  type SyntheticIdentity,
} from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(SYNTHETIC_IDENTITIES)
    private readonly identities: readonly SyntheticIdentity[],
  ) {}

  login(username: string, password: string): LoginResponse {
    const identity = this.identities.find(
      (candidate) =>
        candidate.username === username && candidate.password === password,
    );

    if (identity === undefined) {
      throw new UnauthorizedException();
    }

    const payload =
      identity.role === 'user'
        ? { sub: identity.sub, role: identity.role, rut: identity.rut }
        : { sub: identity.sub, role: identity.role };

    return {
      access_token: this.jwtService.sign(payload, {
        algorithm: 'HS256',
        expiresIn: ACCESS_TOKEN_SECONDS,
      }),
      token_type: 'Bearer',
      expires_in: ACCESS_TOKEN_SECONDS,
    };
  }
}
