import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoinGeckoClient } from './coin-gecko-client';

@Module({
  imports: [HttpModule, ConfigModule.forRoot()],
  controllers: [],
  providers: [CoinGeckoClient],
  exports: [CoinGeckoClient],
})
export class CoinGeckoClientModule {}
