import { Module } from '@nestjs/common';
import { DeoClient } from './deo-client';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule.forRoot()],
  controllers: [],
  providers: [DeoClient],
  exports: [DeoClient],
})
export class DeoClientModule {}
