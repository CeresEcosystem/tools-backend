import { Module } from '@nestjs/common';
import { CoinGeckoClientModule } from '../coin-gecko-client/coin-gecko-client.module';
import { TokenPriceModule } from '../token-price/token-price.module';
import { SoraSupplyClientModule } from '../sora-supply-client/sora-supply-client.module';
import { MarketCapService } from './market-cap.service';

@Module({
  imports: [CoinGeckoClientModule, SoraSupplyClientModule, TokenPriceModule],
  controllers: [],
  providers: [MarketCapService],
  exports: [],
})
export class MarketCapModule {}
