import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { validate } from '~/src/env.validation';
import { configuration } from '~/src/env.configuration';
import { AppController } from '~/src/app.controller';
import { AppService } from '~/src/app.service';
import { AuthService } from '~/src/auth/auth.service';
import { AuthModule } from '~/src/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      validate,
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService,
    AuthService,
  ],
})
export class AppModule {}
