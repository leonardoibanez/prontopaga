import { Logger, RequestMethod, ValidationPipe, type INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { randomUUID } from 'node:crypto';
import type { AuthenticatedPrincipal } from './auth/auth.types';
import { AppModule } from './app.module';

const DEFAULT_FRONTEND_URL = 'http://localhost:3000';
const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_JWT_ISSUER = 'consulta-riesgo-backend';
const DEFAULT_JWT_AUDIENCE = 'consulta-riesgo-frontend';
const DEFAULT_PORT = 3001;
const MIN_PORT = 1;
const MAX_PORT = 65535;
const INVALID_PORT_MESSAGE = 'PORT debe ser un número entre 1 y 65535.';
const INVALID_JWT_SECRET_MESSAGE = 'JWT_SECRET debe contener al menos 32 bytes.';
const INVALID_FRONTEND_URL_MESSAGE = 'FRONTEND_URL debe ser un origen HTTP local o HTTPS válido.';
const INVALID_HOST_MESSAGE = 'HOST debe ser un nombre de host válido.';
const INVALID_DEMO_MODE_MESSAGE = 'DEMO_MODE debe ser true o false.';
const JSON_BODY_LIMIT = '16kb';
const REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{8,100}$/;
const httpLogger = new Logger('HTTP');

type ObservedRequest = {
  readonly method: string;
  readonly originalUrl: string;
  readonly headers: { readonly [name: string]: string | string[] | undefined };
  readonly user?: AuthenticatedPrincipal;
};

type ObservedResponse = {
  readonly statusCode: number;
  setHeader(name: string, value: string): void;
  once(event: 'finish', listener: () => void): void;
};

function safeRouteName(url: string): string {
  const path = url.split('?', 1)[0];
  return path.startsWith('/score/') ? '/score/:rut' : path;
}

export interface BootstrapEnvironment {
  readonly FRONTEND_URL?: string;
  readonly HOST?: string;
  readonly PORT?: string;
  readonly JWT_SECRET?: string;
  readonly JWT_ISSUER?: string;
  readonly JWT_AUDIENCE?: string;
  readonly DEMO_MODE?: string;
  readonly NODE_ENV?: string;
}

export interface BootstrapConfig {
  readonly frontendUrl: string;
  readonly host: string;
  readonly port: number;
  readonly jwtSecret: string;
  readonly jwtIssuer: string;
  readonly jwtAudience: string;
  readonly demoMode: boolean;
}

export interface CreateApplicationOptions {
  readonly logger?: false;
}

function requireJwtSecret(jwtSecret: unknown): string {
  if (
    typeof jwtSecret !== 'string'
    || jwtSecret.trim() !== jwtSecret
    || Buffer.byteLength(jwtSecret, 'utf8') < 32
  ) {
    throw new Error(INVALID_JWT_SECRET_MESSAGE);
  }

  return jwtSecret;
}

function requireIdentifier(value: string | undefined, fallback: string, name: string): string {
  const identifier = value ?? fallback;
  if (identifier.trim() !== identifier || identifier.length === 0 || identifier.length > 200) {
    throw new Error(`${name} debe ser un identificador no vacío.`);
  }
  return identifier;
}

function requireHost(value: string | undefined): string {
  const host = value ?? DEFAULT_HOST;
  if (!/^(?:\[[0-9a-fA-F:]+\]|[a-zA-Z0-9.-]+)$/.test(host)) {
    throw new Error(INVALID_HOST_MESSAGE);
  }
  return host;
}

function requireFrontendUrl(value: string | undefined): string {
  const rawUrl = value ?? DEFAULT_FRONTEND_URL;
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error(INVALID_FRONTEND_URL_MESSAGE);
  }

  const loopbackHosts = new Set(['localhost', '127.0.0.1', '[::1]']);
  const unsafeParts = url.username || url.password || url.search || url.hash || url.pathname !== '/';
  const insecureRemoteOrigin = url.protocol === 'http:' && !loopbackHosts.has(url.hostname);
  if (!url.hostname || !['http:', 'https:'].includes(url.protocol) || unsafeParts || insecureRemoteOrigin) {
    throw new Error(INVALID_FRONTEND_URL_MESSAGE);
  }
  return url.origin;
}

function parseDemoMode(value: string | undefined, production: boolean): boolean {
  if (value === undefined) return !production;
  if (value !== 'true' && value !== 'false') throw new Error(INVALID_DEMO_MODE_MESSAGE);
  const demoMode = value === 'true';
  if (production && demoMode) {
    throw new Error('DEMO_MODE no puede habilitarse en producción.');
  }
  return demoMode;
}

export function parseBootstrapConfig(
  environment: BootstrapEnvironment,
): BootstrapConfig {
  const port = Number(environment.PORT ?? DEFAULT_PORT);
  const jwtSecret = requireJwtSecret(environment.JWT_SECRET);
  const production = environment.NODE_ENV === 'production';

  if (!Number.isInteger(port) || port < MIN_PORT || port > MAX_PORT) {
    throw new Error(INVALID_PORT_MESSAGE);
  }

  return {
    frontendUrl: requireFrontendUrl(environment.FRONTEND_URL),
    host: requireHost(environment.HOST),
    port,
    jwtSecret,
    jwtIssuer: requireIdentifier(environment.JWT_ISSUER, DEFAULT_JWT_ISSUER, 'JWT_ISSUER'),
    jwtAudience: requireIdentifier(environment.JWT_AUDIENCE, DEFAULT_JWT_AUDIENCE, 'JWT_AUDIENCE'),
    demoMode: parseDemoMode(environment.DEMO_MODE, production),
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
  app.use((request: ObservedRequest, response: ObservedResponse, next: () => void) => {
    const candidate = request.headers['x-request-id'];
    const requestId = typeof candidate === 'string' && REQUEST_ID_PATTERN.test(candidate)
      ? candidate
      : randomUUID();
    const startedAt = Date.now();
    response.setHeader('X-Request-ID', requestId);
    response.once('finish', () => {
      httpLogger.log(JSON.stringify({
        requestId,
        method: request.method,
        route: safeRouteName(request.originalUrl),
        status: response.statusCode,
        durationMs: Date.now() - startedAt,
        actor: request.user?.sub ?? null,
      }));
    });
    next();
  });
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
      { path: 'me', method: RequestMethod.GET },
      { path: 'score/:rut', method: RequestMethod.GET },
    ],
  });
  app.enableCors({
    origin(origin, callback) {
      callback(null, origin === undefined || origin === config.frontendUrl);
    },
  });
  app.enableShutdownHooks();

  return app;
}
