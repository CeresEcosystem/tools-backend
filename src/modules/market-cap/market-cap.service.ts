import { Injectable, Logger } from '@nestjs/common';
import { CoinGeckoClient } from '../coin-gecko-client/coin-gecko-client';
import { SoraSupplyClient } from '../sora-supply-client/sora-supply-client';
import { SYMBOLS_AND_GECKO_IDS } from 'src/constants/constants';
import { TokenMarketCap } from './dto/token-market-cap.dto';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from 'src/utils/cron-expression.enum';
import { TokenPriceService } from '../token-price/token-price.service';

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

  private async getMarketCaps(): Promise<TokenMarketCap[]> {
    const allTokens = await this.tokenPriceService.findAll();

    const tokenSymbols: string[] = Array.from(
      Object.keys(SYMBOLS_AND_GECKO_IDS),
    );

    const coinGeckoIds: string[] = Array.from(
      Object.values(SYMBOLS_AND_GECKO_IDS),
    );

    const geckoTokens = (
      await this.coinGeckoClient.getTokensMarketCaps(coinGeckoIds.join(','))
    ).map((token) => {
      const tokenId = token.id;
      const tokenMarketCap = token.market_cap;

      return {
        tokenId,
        tokenMarketCap,
      };
    });

    const geckoTokensAndMarketCaps = geckoTokens.map((token) => {
      const tokenSymbol = getSymbolsByTokenIds(
        SYMBOLS_AND_GECKO_IDS,
        token.tokenId,
      );

      return {
        tokenSymbol,
        marketCap: token.tokenMarketCap,
      };
    });

    const soraTokens = allTokens
      .filter((token) => !tokenSymbols.includes(token.token))
      .map((token) => token.token);

    const soraTokensAndMarketCaps = (
      await this.soraSupplyClient.getSoraTokensSupply(soraTokens)
    ).map((token) => {
      const tokenPrice = allTokens.find((coin) => token.token === coin.token);

      const tokenSymbol = token.token;
      const marketCap = token.supply * tokenPrice.price;

      return {
        tokenSymbol,
        marketCap,
      };
    });

    const marketCaps = [
      ...geckoTokensAndMarketCaps,
      ...soraTokensAndMarketCaps,
    ].filter((value) => value.marketCap);

    return marketCaps;
  }
}

function getSymbolsByTokenIds(object, value: string): string {
  return Object.keys(object).find((key) => object[key] === value);
}
