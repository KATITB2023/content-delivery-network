import { Storage, Bucket } from '@google-cloud/storage';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '~/src/env.validation';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly bucket: Bucket;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {
    this.bucket = new Storage().bucket(
      this.configService.get('BUCKET_NAME', { infer: true }) || 'oskm-web',
    );
  }

  async onModuleInit() {
    await this.bucket.setCorsConfiguration([
      {
        method: ['GET', 'PUT', 'DELETE'],
        origin: ['*'],
        responseHeader: ['Content-Type'],
      },
    ]);
  }

  getHello(): string {
    return 'hello World!';
  }
}
