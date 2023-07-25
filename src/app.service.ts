import { Storage, Bucket } from '@google-cloud/storage';
import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
  StreamableFile,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassThrough, Stream } from 'stream';
import { EnvironmentVariables } from '~/src/env.validation';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly bucket: Bucket;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly httpService: HttpService,
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

  getHello() {
    return 'Hello World!';
  }

  async downloadFile(filepath: string) {
    const ref = this.bucket.file(filepath);
    const [exists] = await ref.exists();

    if (!exists)
      throw new HttpException('File not found!', HttpStatus.NOT_FOUND);

    const expirationTime =
      this.configService.get('URL_EXPIRATION_TIME', {
        infer: true,
      }) || 3600000;

    const [url] = await ref.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + expirationTime,
    });

    const response = await this.httpService.axiosRef.get<Stream>(url, {
      responseType: 'stream',
    });

    const passThrough = new PassThrough();
    response.data.pipe(passThrough);

    return {
      streamableFile: new StreamableFile(passThrough),
      contentType: response.headers['Content-Type'],
    };
  }

  async uploadFile(filepath: string, file: Express.Multer.File) {
    const ref = this.bucket.file(filepath);
    const [exists] = await ref.exists();

    if (exists)
      throw new HttpException('File already exists!', HttpStatus.CONFLICT);

    const expirationTime =
      this.configService.get('URL_EXPIRATION_TIME', {
        infer: true,
      }) || 3600000;

    const [url] = await ref.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + expirationTime,
    });

    return await this.httpService.axiosRef.put<void>(url, file.buffer, {
      headers: {
        'Content-Type': file.mimetype,
      },
    });
  }

  async deleteFile(filepath: string) {
    const ref = this.bucket.file(filepath);
    const [exists] = await ref.exists();

    if (!exists)
      throw new HttpException('File not found!', HttpStatus.NOT_FOUND);

    const expirationTime =
      this.configService.get('URL_EXPIRATION_TIME', {
        infer: true,
      }) || 3600000;

    const [url] = await ref.getSignedUrl({
      version: 'v4',
      action: 'delete',
      expires: Date.now() + expirationTime,
    });

    return await this.httpService.axiosRef.delete<void>(url);
  }
}
