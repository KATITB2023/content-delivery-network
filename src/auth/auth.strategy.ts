import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '~/src/auth/auth.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'api-key',
) {
  constructor(private readonly authService: AuthService) {
    super(
      { header: 'api-key', prefix: '' },
      true,
      async (
        apiKey: string,
        verified: (err: Error | null, user?: unknown, info?: unknown) => void,
      ) => {
        if (!this.authService.validateApiKey(apiKey))
          verified(new UnauthorizedException(), false);
        verified(null, true);
      },
    );
  }
}
