import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SoraSupplyClient } from './sora-supply-client';

@Module({
  imports: [HttpModule, ConfigModule.forRoot()],
  controllers: [],
  providers: [SoraSupplyClient],
  exports: [SoraSupplyClient],
})
export class SoraSupplyClientModule {}
