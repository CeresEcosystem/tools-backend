import { Injectable, Logger } from '@nestjs/common';
import { CoinGeckoClient } from '../coin-gecko-client/coin-gecko-client';
import { SoraSupplyClient } from '../sora-supply-client/sora-supply-client';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TokenPriceService } from '../token-price/token-price.service';
import {
  COIN_GECKO_TOKEN_IDS,
  COIN_GECKO_TOKEN_SYMBOLS,
} from 'src/constants/constants';
import { TokenMarketCapDto } from './dto/token-market-cap.dto';

@Injectable()
export class MarketCapService {
  private logger = new Logger(MarketCapService.name);

  constructor(
    private readonly coinGeckoClient: CoinGeckoClient,
    private readonly soraSupplyClient: SoraSupplyClient,
    private readonly tokenPriceService: TokenPriceService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  private async updateMarketCap(): Promise<void> {
    this.logger.log('Start updating market caps');
    const marketCaps = await this.getMarketCaps();

    marketCaps.forEach((tokenMarketCap) => {
      const symbol = tokenMarketCap.tokenSymbol;
      const marketCap = tokenMarketCap.marketCap.toString();
      this.tokenPriceService.updateMarketCap(symbol, marketCap);
    });

    this.logger.log('Updating market caps successful!');
  }

  private async getMarketCaps(): Promise<TokenMarketCapDto[]> {
    const geckoMarketCaps = await this.getGeckoTokenMarketCaps();
    const soraMarketCaps = await this.getSoraMarketCaps();

    return [...geckoMarketCaps, ...soraMarketCaps];
  }

  private getGeckoTokenMarketCaps(): Promise<TokenMarketCapDto[]> {
    return this.coinGeckoClient.getTokensMarketCaps(COIN_GECKO_TOKEN_IDS);
  }

  private async getSoraMarketCaps(): Promise<TokenMarketCapDto[]> {
    const allTokens = await this.tokenPriceService.findAll();

    const soraTokens = allTokens
      .filter((token) => !COIN_GECKO_TOKEN_SYMBOLS.includes(token.token))
      .map((token) => token.token);

    const soraTokensSupply = await this.soraSupplyClient.getSoraTokensSupply(
      soraTokens,
    );

    return soraTokensSupply.map((tokenSupply) => {
      const { token, supply } = tokenSupply;
      const tokenPrice = allTokens.find((coin) => token === coin.token);

      return {
        tokenSymbol: token,
        marketCap: supply * tokenPrice.price,
      };
    });
  }
}
