import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  public readonly NODE_ENV: Environment;

  @IsNumber()
  public readonly PORT: number;

  @IsString()
  public readonly GOOGLE_APPLICATION_CREDENTIALS: string;

  @IsString()
  public readonly BUCKET_NAME: string;

  constructor(
    NODE_ENV: Environment,
    PORT: number,
    GOOGLE_APPLICATION_CREDENTIALS: string,
    BUCKET_NAME: string,
  ) {
    this.NODE_ENV = NODE_ENV;
    this.PORT = PORT;
    this.GOOGLE_APPLICATION_CREDENTIALS = GOOGLE_APPLICATION_CREDENTIALS;
    this.BUCKET_NAME = BUCKET_NAME;
  }
}

export const validate = (config: Record<string, unknown>) => {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) throw new Error(errors.toString());

  return validatedConfig;
};
