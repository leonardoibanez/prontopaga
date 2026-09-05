import { Module, type DynamicModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { ScoreModule } from './score/score.module';

@Module({})
export class AppModule {
  static register(config: { readonly jwtSecret: string }): DynamicModule {
    const authModule = AuthModule.register(config);

    return {
      module: AppModule,
      imports: [HealthModule, authModule, ScoreModule.register(authModule)],
    };
  }
}
