import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '~/src/env.validation';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  validateApiKey(apiKey: string) {
    const apiKeys = this.configService.get('API_KEY', { infer: true }) || [];

    return apiKeys.includes(apiKey);
  }
}
