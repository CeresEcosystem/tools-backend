import { Injectable } from '@nestjs/common';
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
    const price = await this.repository
      .createQueryBuilder()
      .distinctOn(['token'])
      .select(['price'])
      .where({
        token,
        createdAt: Between(this.sub2Mins(date), this.add2Mins(date)),
      })
      .getRawMany<{ price: string }>();

    return Number(price);
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
        percentageDiff: currentPrice.div(oldPrice).minus(1).mul(100),
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
    const params = [this.resolveResolution(resolution), symbol];

    let query = `
        select array_agg(t) as t, array_agg(o) as o, array_agg(c) as c, 
               array_agg(h) as h, array_agg(l) as l from (
            select ts as t, open as o, close as c, high as h, low as l, 0 as v from (
                select * from (
                    select extract(epoch from day) as ts, open, close, high, low from (
                        SELECT time_bucket(cast($1 as interval), created_at) AS day,
                        first(price, extract(epoch from created_at)) AS open,
                        last(price, extract(epoch from created_at)) AS close,
                        max(price) AS high,
                        min(price) AS low
                        FROM prices
                        WHERE token = $2
                        and created_at >= '2021-10-22'
                        GROUP BY day
                        ORDER BY day asc
                    ) as t1
                    where day >= '2021-10-22'
                ) as t2
                where `;

    if (countback) {
      query += `ts <= $3
                order by ts desc
                limit $4`;

      params.push(to.toString());
      params.push(countback.toString());
    } else {
      query += `ts between $3 and $4
                order by ts desc`;

      params.push(from.toString());
      params.push(to.toString());
    }

    query += `) as t3
            order by ts asc
        ) as t4;`;

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
