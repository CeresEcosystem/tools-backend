import { Module } from '@nestjs/common';
import { FarmingClient } from './farming-client';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule.forRoot()],
  controllers: [],
  providers: [FarmingClient],
  exports: [FarmingClient],
})
export class FarmingApiClinetModule {}
