import {
  Inject,
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { isValidRut } from '../rut/rut';
import {
  ACCESS_TOKEN_SECONDS,
  SYNTHETIC_IDENTITIES,
  type AuthenticatedPrincipal,
  type SyntheticIdentity,
} from './auth.types';

interface RequestWithPrincipal {
  readonly headers: { readonly authorization?: string };
  user?: AuthenticatedPrincipal;
}

type UntrustedClaims = Record<string, unknown>;

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(SYNTHETIC_IDENTITIES)
    private readonly identities: readonly SyntheticIdentity[],
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithPrincipal>();

    try {
      const token = this.extractBearerToken(request.headers.authorization);
      const claims = this.jwtService.verify<UntrustedClaims>(token, {
        algorithms: ['HS256'],
      });
      request.user = this.toPrincipal(claims);
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private extractBearerToken(authorization: string | undefined): string {
    if (typeof authorization !== 'string') {
      throw new Error('Missing bearer token');
    }

    const match = /^Bearer ([^\s]+)$/.exec(authorization);
    if (match === null) {
      throw new Error('Malformed bearer token');
    }

    return match[1];
  }

  private toPrincipal(claims: UntrustedClaims): AuthenticatedPrincipal {
    const now = Math.floor(Date.now() / 1000);
    const { sub, role, iat, exp, rut } = claims;
    if (
      typeof sub !== 'string' ||
      sub.length === 0 ||
      (role !== 'admin' && role !== 'user') ||
      typeof iat !== 'number' ||
      !Number.isInteger(iat) ||
      typeof exp !== 'number' ||
      !Number.isInteger(exp) ||
      iat > now ||
      now >= exp ||
      exp - iat !== ACCESS_TOKEN_SECONDS
    ) {
      throw new Error('Invalid access-token claims');
    }

    const identity = this.identities.find((candidate) => candidate.sub === sub);
    if (identity === undefined || identity.role !== role) {
      throw new Error('Unknown access-token identity');
    }

    if (identity.role === 'admin') {
      if ('rut' in claims) {
        throw new Error('Administrator token must not contain RUT');
      }
      return { sub: identity.sub, role: 'admin' };
    }

    if (
      typeof rut !== 'string' ||
      !isValidRut(rut) ||
      rut !== identity.rut
    ) {
      throw new Error('Invalid user RUT claim');
    }

    return { sub: identity.sub, role: 'user', rut: identity.rut };
  }
}
