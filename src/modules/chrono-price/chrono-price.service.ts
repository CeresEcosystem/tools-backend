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

@Injectable()
export class ChronoPriceService {
  private readonly logger = new Logger(ChronoPriceService.name);

  constructor(
    @InjectDataSource('pg')
    private readonly dataSource: DataSource,
    @InjectRepository(ChronoPrice, 'pg')
    private readonly repository: Repository<ChronoPrice>,
  ) {}

  public save(chronoPriceDtos: ChronoPriceDto[]): void {
    this.repository.insert(chronoPriceDtos);
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

  // TODO: Define return type
  public async getPriceForChart(
    symbol: string,
    resolution: string,
    from: number,
    to: number,
    countback: number,
  ): Promise<unknown> {
    const { query, params } = this.buildQuery(
      symbol,
      resolution,
      from,
      to,
      countback,
    );

    const [tokenPrices] = await this.dataSource.query(query, params);

    if (!tokenPrices || !tokenPrices.t) {
      return {
        s: 'no_data',
        noData: true,
      };
    }

    tokenPrices.s = 'ok';

    return tokenPrices;
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

      if (!priceChange) {
        return {
          token: tokenEntity.token,
          intervalHours,
          currentPrice,
          oldPrice: new Big(0),
          valueDiff: new Big(0),
          percentageDiff: new Big(0),
        };
      }

      const oldPrice = new Big(priceChange.price);

      return {
        token: tokenEntity.token,
        intervalHours,
        currentPrice,
        oldPrice,
        valueDiff: currentPrice.minus(oldPrice),
        percentageDiff: oldPrice.eq(0)
          ? new Big(0)
          : currentPrice.div(oldPrice).minus(1).mul(100),
      };
    });
  }

  private buildQuery(
    symbol: string,
    resolution: string,
    from: number,
    to: number,
    countback: number,
  ): { query: string; params: string[] } {
    const params = [
      this.resolveResolution(resolution),
      symbol,
      from.toString(),
      to.toString(),
      countback.toString(),
    ];

    const query = `
      SELECT 
          array_agg(ts) AS t, 
          array_agg(open) AS o, array_agg(close) AS c, 
          array_agg(high) AS h, array_agg(low) AS l
      FROM (
          SELECT 
              extract(epoch from period) AS ts, 
              open, close, high, low
          FROM (
              SELECT 
                  time_bucket(cast($1 as interval), created_at) AS period,
                  first(price, created_at) AS open,
                  last(price, created_at) AS close,
                  max(price) AS high,
                  min(price) AS low
              FROM prices
              WHERE 
                  token = $2
                  AND created_at >= TO_TIMESTAMP($3)
                  AND created_at < TO_TIMESTAMP($4)
              GROUP BY period
          ) AS t1
          ORDER BY ts ASC LIMIT $5
      ) AS t2;`;

    return {
      query,
      params,
    };
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
