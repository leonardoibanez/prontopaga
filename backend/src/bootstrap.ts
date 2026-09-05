import { RequestMethod, ValidationPipe, type INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

const DEFAULT_FRONTEND_URL = 'http://localhost:3000';
const DEFAULT_PORT = 3001;
const MIN_PORT = 1;
const MAX_PORT = 65535;
const INVALID_PORT_MESSAGE = 'PORT debe ser un número entre 1 y 65535.';
const MISSING_JWT_SECRET_MESSAGE = 'JWT_SECRET debe ser una cadena no vacía.';
const JSON_BODY_LIMIT = '16kb';

export interface BootstrapEnvironment {
  readonly FRONTEND_URL?: string;
  readonly PORT?: string;
  readonly JWT_SECRET?: string;
}

export interface BootstrapConfig {
  readonly frontendUrl: string;
  readonly port: number;
  readonly jwtSecret: string;
}

export interface CreateApplicationOptions {
  readonly logger?: false;
}

function requireJwtSecret(jwtSecret: unknown): string {
  if (typeof jwtSecret !== 'string' || jwtSecret.trim().length === 0) {
    throw new Error(MISSING_JWT_SECRET_MESSAGE);
  }

  return jwtSecret.trim();
}

export function parseBootstrapConfig(
  environment: BootstrapEnvironment,
): BootstrapConfig {
  const port = Number(environment.PORT ?? DEFAULT_PORT);
  const jwtSecret = requireJwtSecret(environment.JWT_SECRET);

  if (!Number.isInteger(port) || port < MIN_PORT || port > MAX_PORT) {
    throw new Error(INVALID_PORT_MESSAGE);
  }

  return {
    frontendUrl: environment.FRONTEND_URL ?? DEFAULT_FRONTEND_URL,
    port,
    jwtSecret,
  };
}

export async function createApplication(
  config: BootstrapConfig,
  options?: CreateApplicationOptions,
): Promise<INestApplication> {
  const jwtSecret = requireJwtSecret(config.jwtSecret);
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule.register({ ...config, jwtSecret }),
    {
    ...options,
    bodyParser: false,
    },
  );
  app.useBodyParser('json', { limit: JSON_BODY_LIMIT });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );
  app.setGlobalPrefix('api', {
    exclude: [
      { path: 'login', method: RequestMethod.POST },
      { path: 'score/:rut', method: RequestMethod.GET },
    ],
  });
  app.enableCors({ origin: config.frontendUrl });
  app.enableShutdownHooks();

  return app;
}
