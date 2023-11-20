import { Module } from '@nestjs/common';
import { OneSignalClient } from './one-signal-client';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule.forRoot(), HttpModule],
  controllers: [],
  providers: [OneSignalClient],
  exports: [OneSignalClient],
})
export class OneSignalModule {}
