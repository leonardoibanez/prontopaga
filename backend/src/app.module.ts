import { Module, type DynamicModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';

@Module({})
export class AppModule {
  static register(config: { readonly jwtSecret: string }): DynamicModule {
    return {
      module: AppModule,
      imports: [HealthModule, AuthModule.register(config)],
    };
  }
}
