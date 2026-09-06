import { Module, type DynamicModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { ScoreModule } from './score/score.module';
import { SecurityModule } from './security/security.module';

@Module({})
export class AppModule {
  static register(config: {
    readonly jwtSecret: string;
    readonly jwtIssuer: string;
    readonly jwtAudience: string;
    readonly demoMode: boolean;
  }): DynamicModule {
    const authModule = AuthModule.register(config);

    return {
      module: AppModule,
      imports: [SecurityModule, HealthModule, authModule, ScoreModule.register(authModule)],
    };
  }
}
