import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import helmet from 'helmet';
import { EnvironmentVariables } from '~/src/env.validation';
import { AppModule } from '~/src/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  /** Enable Helmet */
  app.use(helmet());

  /** Enable GZIP Compression */
  app.use(compression());

  /** Enable CORS */
  app.enableCors();

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

  /** Get Configuration Service */
  const configService = app.get(ConfigService<EnvironmentVariables>);

  /** Get Port from Configuration */
  const port = configService.get('PORT', { infer: true }) || 3000;

  /** Start the Application */
  await app.listen(port);
}

bootstrap();
