import { Injectable, Logger } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ManagedUpload } from 'aws-sdk/clients/s3';

@Injectable()
export class S3Client {
  private readonly logger = new Logger(S3Client.name);
  private readonly s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_DEFAULT_REGION,
  });

  public upload(
    path: string,
    file: Express.Multer.File,
    fileName?: string,
  ): Promise<string> {
    const params = {
      Bucket: `${process.env.AWS_BUCKET}/${path}`,
      Key: fileName ?? file.originalname,
      Body: file.buffer,
    };

    return new Promise((resolve, reject) => {
      this.s3.upload(params, (err: Error, data: ManagedUpload.SendData) => {
        if (err) {
          this.logger.error(err);
          reject(err.message);
        }
        resolve(data.Location);
      });
    });
  }
}
