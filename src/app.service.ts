import { Storage, Bucket } from '@google-cloud/storage';
import {
  HttpException,
  HttpStatus,
  Injectable,
  StreamableFile,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassThrough, Readable } from 'stream';
import { EnvironmentVariables } from '~/src/env.validation';

@Injectable()
export class AppService {
  private readonly bucket: Bucket;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {
    this.bucket = new Storage().bucket(
      this.configService.get('BUCKET_NAME', { infer: true }) || 'oskm-web',
    );
  }

  getHello() {
    return 'Hello World!';
  }

  async downloadFile(filepath: string) {
    const ref = this.bucket.file(filepath);
    const [exists] = await ref.exists();

    if (!exists)
      throw new HttpException('File not found!', HttpStatus.NOT_FOUND);

    const readStream = ref.createReadStream();
    const passThrough = new PassThrough();
    readStream.pipe(passThrough);

    const [metadata] = await ref.getMetadata();

    return {
      streamableFile: new StreamableFile(passThrough),
      contentType: metadata.contentType,
    };
  }

  async uploadFile(filepath: string, file: Express.Multer.File) {
    const ref = this.bucket.file(filepath);
    const [exists] = await ref.exists();

    if (exists)
      throw new HttpException('File already exists!', HttpStatus.CONFLICT);

    const writeStream = ref.createWriteStream();
    const fileStream = Readable.from(file.buffer);

    fileStream.pipe(writeStream);
  }

  async deleteFile(filepath: string) {
    const ref = this.bucket.file(filepath);
    const [exists] = await ref.exists();

    if (!exists)
      throw new HttpException('File not found!', HttpStatus.NOT_FOUND);

    await ref.delete();
  }
}
