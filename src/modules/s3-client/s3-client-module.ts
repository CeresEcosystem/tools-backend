import { Module } from '@nestjs/common';
import { S3Client } from './s3-client';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [],
  providers: [S3Client],
  exports: [S3Client],
})
export class S3ClientModule {}
