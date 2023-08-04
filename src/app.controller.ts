import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from '~/src/app.service';
import { ApiKeyAuthGuard } from '~/src/auth/auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  hello() {
    return this.appService.getHello();
  }

  @Get(':filepath(*)')
  async downloadFile(
    @Param('filepath') filepath: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const { streamableFile, contentType } =
        await this.appService.downloadFile(filepath);

      res.set({
        'Content-Type': contentType,
      });

      return streamableFile;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      if (error instanceof Error) {
        console.log('error:', error);
        throw new HttpException(
          {
            status: HttpStatus.SERVICE_UNAVAILABLE,
            message: 'Could not download file!',
          },
          HttpStatus.SERVICE_UNAVAILABLE,
          {
            cause: error,
          },
        );
      }

      throw new HttpException(
        'Internal server error!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':filepath(*)')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(ApiKeyAuthGuard)
  async uploadFile(
    @Param('filepath') filepath: string,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    try {
      return await this.appService.uploadFile(filepath, file);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      if (error instanceof Error) {
        console.log('error:', error);
        throw new HttpException(
          {
            status: HttpStatus.SERVICE_UNAVAILABLE,
            message: 'Could not upload file!',
          },
          HttpStatus.SERVICE_UNAVAILABLE,
          {
            cause: error,
          },
        );
      }

      throw new HttpException(
        'Internal server error!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':filepath(*)')
  @UseGuards(ApiKeyAuthGuard)
  async deleteFile(@Param('filepath') filepath: string) {
    try {
      return await this.appService.deleteFile(filepath);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      if (error instanceof Error) {
        console.log('error:', error);
        throw new HttpException(
          {
            status: HttpStatus.SERVICE_UNAVAILABLE,
            message: 'Could not delete file!',
          },
          HttpStatus.SERVICE_UNAVAILABLE,
          {
            cause: error,
          },
        );
      }

      throw new HttpException(
        'Internal server error!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
