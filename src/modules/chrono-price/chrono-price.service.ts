import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, In, Repository } from 'typeorm';
import { ChronoPriceDto } from './dto/chrono-price.dto';
import { ChronoPrice } from './entity/chrono-price.entity';
import { isNumberString } from 'class-validator';
import Big from 'big.js';
import { subtractHours } from 'src/utils/date-utils';
import { PriceChangeDto } from './dto/price-change.dto';
import { TokenPrice } from '../token-price/entity/token-price.entity';
import {
  PRICE_HISTORY_CACHE_QUERY,
  PRICE_HISTORY_QUERY,
} from './chrono-price.const';
import { TradingPricesChartDto } from './dto/trading-prices-chart.dto';

@Injectable()
export class ChronoPriceService {
  private readonly logger = new Logger(ChronoPriceService.name);

  constructor(
    @InjectDataSource('pg')
    private readonly dataSource: DataSource,
    @InjectRepository(ChronoPrice, 'pg')
    private readonly repository: Repository<ChronoPrice>,
  ) {}

  public async save(chronoPriceDtos: ChronoPriceDto[]): Promise<void> {
    await this.repository.insert(chronoPriceDtos);
  }

  public async getPriceChangePerIntervals(
    tokenEntities: TokenPrice[],
    intervalsInHours: number[],
  ): Promise<PriceChangeDto[]> {
    const result = await Promise.all(
      intervalsInHours.map((intervalHours) =>
        this.getPriceChangeForInterval(tokenEntities, intervalHours),
      ),
    );

    return result.flat();
  }

  public async getNearestPrice(token: string, date: Date): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .select(['price'])
      .where({
        token,
        createdAt: Between(
          this.sub2Mins(new Date(date)),
          this.add2Mins(new Date(date)),
        ),
      })
      .getRawOne<{ price: string }>();

    return Number(result.price);
  }

  public async getPricesForChart(
    symbol: string,
    resolution: string,
    from: number,
    to: number,
    countback: number,
  ): Promise<TradingPricesChartDto> {
    const params = this.buildQueryParams(
      symbol,
      resolution,
      from,
      to,
      countback,
    );

    const [tokenPrices] = await this.dataSource.query(
      process.env.CHART_USE_CACHE
        ? PRICE_HISTORY_CACHE_QUERY
        : PRICE_HISTORY_QUERY,
      params,
    );

    return {
      t: tokenPrices.t,
      o: tokenPrices.o,
      h: tokenPrices.h,
      c: tokenPrices.c,
      l: tokenPrices.l,
    };
  }

  public async getAvgTokenPriceForPeriod(
    token: string,
    dateFrom: Date,
    dateTo: Date,
  ): Promise<number> {
    const avgPriceResult = await this.repository
      .createQueryBuilder()
      .select('AVG(price)', 'avgPrice')
      .where({ token, createdAt: Between(dateFrom, dateTo) })
      .groupBy('token')
      .getRawOne<{ avgPrice: number }>();

    return avgPriceResult?.avgPrice || 0;
  }

  private async getPriceChangeForInterval(
    tokenEntities: TokenPrice[],
    intervalHours: number,
  ): Promise<PriceChangeDto[]> {
    const tokens = tokenEntities.map((tokenEntity) => tokenEntity.token);
    const latestEntry = tokenEntities.reduce((t1, t2) =>
      t1.updatedAt > t2.updatedAt ? t1 : t2,
    ).updatedAt;

    const priceChanges = await this.repository
      .createQueryBuilder()
      .distinctOn(['token'])
      .select(['token', 'price'])
      .where({
        token: In(tokens),
        createdAt: Between(
          this.sub2Mins(subtractHours(new Date(latestEntry), intervalHours)),
          this.add2Mins(subtractHours(new Date(latestEntry), intervalHours)),
        ),
      })
      .getRawMany<{ token: string; price: string }>();

    return tokenEntities.map((tokenEntity) => {
      const priceChange = priceChanges.find(
        (priceChange) => priceChange.token === tokenEntity.token,
      );

      const currentPrice = new Big(tokenEntity.price);
      const oldPrice = priceChange ? new Big(priceChange.price) : new Big(0);
      const valueDiff = priceChange ? currentPrice.minus(oldPrice) : new Big(0);
      const percentageDiff =
        priceChange && oldPrice.gt(0)
          ? currentPrice.div(oldPrice).minus(1).mul(100)
          : new Big(0);

      return {
        token: tokenEntity.token,
        intervalHours,
        currentPrice,
        oldPrice,
        valueDiff,
        percentageDiff,
      };
    });
  }

  private buildQueryParams(
    symbol: string,
    resolution: string,
    from: number,
    to: number,
    countback: number,
  ): string[] {
    return [
      this.resolveResolution(resolution),
      symbol,
      from.toString(),
      to.toString(),
      countback.toString(),
    ];
  }

  private resolveResolution(resolution: string): string {
    if (isNumberString(resolution)) {
      return `${resolution}m`;
    }

    return resolution;
  }

  private sub2Mins(date: Date): Date {
    date.setMinutes(date.getMinutes() - 2);

    return date;
  }

  private add2Mins(date: Date): Date {
    date.setMinutes(date.getMinutes() + 2);

    return date;
  }
}
