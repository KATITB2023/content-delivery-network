import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthService],
})
export class AppModule {}
