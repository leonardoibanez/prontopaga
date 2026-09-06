import 'reflect-metadata';
import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { createApplication, parseBootstrapConfig } from './bootstrap';

async function bootstrap() {
  const config = parseBootstrapConfig(process.env);
  const app = await createApplication(config);
  await app.listen(config.port, config.host);
  Logger.log(`API disponible en http://${config.host}:${config.port}/api`, 'Bootstrap');
}

bootstrap().catch((error: unknown) => {
  Logger.error(error, undefined, 'Bootstrap');
  process.exitCode = 1;
});
