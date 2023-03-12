import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ChronoPriceDto } from './dto/chrono-price.dto';
import { ChronoPrice } from './entity/chrono-price.entity';

@Injectable()
export class ChronoPriceService {
  private readonly logger = new Logger(ChronoPriceService.name);

  constructor(
    @InjectDataSource('pg')
    private readonly dataSource: DataSource,
    @InjectRepository(ChronoPrice, 'pg')
    private readonly repository: Repository<ChronoPrice>,
  ) {}

  public save(chronoPriceDtos: ChronoPriceDto[]) {
    this.repository.insert(chronoPriceDtos);
  }

  public async getPriceForChart(
    symbol: string,
    resolution: number,
    from: number,
    to: number,
    countback: number,
  ) {
    const { query, params } = this.buildQuery(
      symbol,
      resolution,
      from,
      to,
      countback,
    );

    const tokenPrices = (await this.dataSource.query(query, params))[0];

    if (!tokenPrices || !tokenPrices.t) {
      return {
        s: 'no_data',
        noData: true,
      };
    }

    tokenPrices.s = 'ok';

    return tokenPrices;
  }

  private buildQuery(
    symbol: string,
    resolution: number,
    from: number,
    to: number,
    countback: number,
  ) {
    const params = [resolution + 'm', symbol];

    let query = `
        select array_agg(t) as t, array_agg(o) as o, array_agg(c) as c, array_agg(h) as h, array_agg(l) as l from (
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
}
