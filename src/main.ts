import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import helmet from 'helmet';
import { EnvironmentVariables } from '~/src/env.validation';
import { AppModule } from '~/src/app.module';

async function bootstrap() {
  /** Create Nest Application */
  const app = await NestFactory.create(AppModule, {
    cors: true,
    bufferLogs: true,
  });

  /** Get Configuration Service */
  const configService = app.get(ConfigService<EnvironmentVariables>);

  /** Enable Helmet */
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );

  /** Enable GZIP Compression */
  app.use(compression());

  /** Enable Input Validation */
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  /** Enable API Versioning */
  app.enableVersioning({
    type: VersioningType.URI,
  });

  /** Get Port from Configuration */
  const port = configService.get('PORT', { infer: true }) || 3000;

  /** Start the Application */
  await app.listen(port);
}

bootstrap();
