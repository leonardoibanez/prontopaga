import 'reflect-metadata';
import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { createApplication, parseBootstrapConfig } from './bootstrap';

async function bootstrap() {
  const config = parseBootstrapConfig(process.env);
  const app = await createApplication(config);
  await app.listen(config.port);
  Logger.log(`API disponible en http://localhost:${config.port}/api`, 'Bootstrap');
}

bootstrap().catch((error: unknown) => {
  Logger.error(error, undefined, 'Bootstrap');
  process.exitCode = 1;
});
