import { Module, type DynamicModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { SessionController } from './session.controller';
import { LoginRateLimitGuard } from './login-rate-limit.guard';
import { SYNTHETIC_IDENTITIES } from './auth.types';
import { SYNTHETIC_IDENTITIES as syntheticIdentities } from './synthetic-identities';

@Module({})
export class AuthModule {
  static register(config: {
    readonly jwtSecret: string;
    readonly jwtIssuer: string;
    readonly jwtAudience: string;
    readonly demoMode: boolean;
  }): DynamicModule {
    return {
      module: AuthModule,
      imports: [
        JwtModule.register({
          secret: config.jwtSecret,
          signOptions: {
            algorithm: 'HS256',
            expiresIn: 900,
            issuer: config.jwtIssuer,
            audience: config.jwtAudience,
          },
          verifyOptions: {
            algorithms: ['HS256'],
            issuer: config.jwtIssuer,
            audience: config.jwtAudience,
          },
        }),
      ],
      controllers: [AuthController, SessionController],
      providers: [
        AuthService,
        AuthGuard,
        LoginRateLimitGuard,
        {
          provide: SYNTHETIC_IDENTITIES,
          useValue: config.demoMode ? syntheticIdentities : Object.freeze([]),
        },
      ],
      exports: [AuthService, AuthGuard, JwtModule, SYNTHETIC_IDENTITIES],
    };
  }
}
