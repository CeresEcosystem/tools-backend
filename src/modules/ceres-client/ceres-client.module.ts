import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CeresClient } from './ceres-client';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule.forRoot()],
  controllers: [],
  providers: [CeresClient],
  exports: [CeresClient],
})
export class CeresClientModule {}
