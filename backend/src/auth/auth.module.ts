import { Module, type DynamicModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { SYNTHETIC_IDENTITIES } from './auth.types';
import { SYNTHETIC_IDENTITIES as syntheticIdentities } from './synthetic-identities';

@Module({})
export class AuthModule {
  static register(config: { readonly jwtSecret: string }): DynamicModule {
    return {
      module: AuthModule,
      imports: [
        JwtModule.register({
          secret: config.jwtSecret,
          signOptions: { algorithm: 'HS256', expiresIn: 900 },
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        AuthGuard,
        { provide: SYNTHETIC_IDENTITIES, useValue: syntheticIdentities },
      ],
      exports: [AuthService, AuthGuard, JwtModule, SYNTHETIC_IDENTITIES],
    };
  }
}
