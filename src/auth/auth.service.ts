import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '~/src/env.validation';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  validateApiKey(apiKey: string) {
    const apiKeys = this.configService.get<string[]>('API_KEY') || [];

    return apiKeys.includes(apiKey);
  }
}
