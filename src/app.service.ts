import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';
import { EnvironmentVariables } from '~/src/env.validation';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private configService: ConfigService<EnvironmentVariables>) {}

  async onModuleInit() {
    /** Do Something */
  }

  @SkipThrottle()
  get hello(): string {
    return 'hello World!';
  }
}
