import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const DEFAULT_FRONTEND_URL = 'http://localhost:3000';
const DEFAULT_PORT = 3001;
const MIN_PORT = 1;
const MAX_PORT = 65535;
const INVALID_PORT_MESSAGE = 'PORT debe ser un número entre 1 y 65535.';

export interface BootstrapEnvironment {
  readonly FRONTEND_URL?: string;
  readonly PORT?: string;
}

export interface BootstrapConfig {
  readonly frontendUrl: string;
  readonly port: number;
}

export interface CreateApplicationOptions {
  readonly logger?: false;
}

export function parseBootstrapConfig(
  environment: BootstrapEnvironment,
): BootstrapConfig {
  const port = Number(environment.PORT ?? DEFAULT_PORT);

  if (!Number.isInteger(port) || port < MIN_PORT || port > MAX_PORT) {
    throw new Error(INVALID_PORT_MESSAGE);
  }

  return {
    frontendUrl: environment.FRONTEND_URL ?? DEFAULT_FRONTEND_URL,
    port,
  };
}

export async function createApplication(
  config: BootstrapConfig,
  options?: CreateApplicationOptions,
): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, options);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: config.frontendUrl });
  app.enableShutdownHooks();

  return app;
}
