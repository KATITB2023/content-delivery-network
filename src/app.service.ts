import { Bucket, Storage } from '@google-cloud/storage';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';
import { Readable } from 'stream';
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

  getWidthQualityFile(
    filename: string,
    extension?: string,
    width?: number,
    quality?: number,
  ) {
    const searchParams = new URLSearchParams();
    if (width) {
      searchParams.append('w', width.toString());
    }
    if (quality) {
      searchParams.append('q', quality.toString());
    }
    return `${filename}_${searchParams.toString()}${
      extension ? `.${extension}` : ''
    }`;
  }

  getNameAndExtension(filepath: string): [string, string | undefined] {
    const parts = filepath.split('.');
    const extension = parts.pop();
    const name = parts.join('.');
    return [name, extension];
  }

  async downloadFile(filepath: string, width?: number, quality?: number) {
    const results = this.getNameAndExtension(filepath);
    const filename = results[0];
    let extension = results[1];
    // if not an compressable image or no width and no quality, just redirect to url
    if (
      !extension ||
      !/^(jpeg|png|webp|jpg)$/i.test(extension) ||
      (!width && !quality)
    ) {
      const ref = this.bucket.file(filepath);
      const [exists] = await ref.exists();
      if (!exists)
        throw new HttpException('File not found!', HttpStatus.NOT_FOUND);
      return ref.publicUrl();
    }
    const optimizedPath = this.getWidthQualityFile(
      filename,
      extension,
      width,
      quality,
    );
    const optimizedRef = this.bucket.file(optimizedPath);
    const [optimizedExists] = await optimizedRef.exists();
    if (optimizedExists) {
      return optimizedRef.publicUrl();
    }

    const ref = this.bucket.file(filepath);
    const [exists] = await ref.exists();
    if (!exists)
      throw new HttpException('File not found!', HttpStatus.NOT_FOUND);

    const [image] = await ref.download();
    let sharpImage = sharp(image);
    if (extension === 'jpg') {
      sharpImage = sharpImage.toFormat('jpeg');
      extension = 'jpeg';
    }
    if (width) {
      sharpImage = sharpImage.resize(width);
    }
    if (quality) {
      sharpImage = sharpImage[extension as 'jpeg' | 'png' | 'webp']({
        quality,
      });
    }

    const writeStream = optimizedRef.createWriteStream();
    const fileStream = Readable.from(await sharpImage.toBuffer());
    fileStream.pipe(writeStream);
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
    return optimizedRef.publicUrl();
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
