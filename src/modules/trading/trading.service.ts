import { Injectable } from '@nestjs/common';
import { ChronoPriceService } from '../chrono-price/chrono-price.service';
import { VolumesService } from '../volumes/volumes.service';
import { TradingChartDto } from './dto/trading-chart.dto';
import { TradingChartQuery } from './dto/trading-chart-query.dto';
import { TradingPricesChartDto } from '../chrono-price/dto/trading-prices-chart.dto';
import { TradingVolumesChartDto } from '../volumes/dto/trading-volumes-chart.dto';

@Injectable()
export class TradingService {
  constructor(
    private readonly chronoPriceService: ChronoPriceService,
    private readonly volumesService: VolumesService,
  ) {}

  public async getTradingChartData(
    queryParams: TradingChartQuery,
  ): Promise<TradingChartDto> {
    const { symbol, resolution, from, to, countback } = queryParams;

    const tradingPricesChartData =
      await this.chronoPriceService.getPricesForChart(
        symbol,
        resolution,
        from,
        to,
        countback,
      );

    const tradingVolumesChartData =
      await this.volumesService.getVolumesForChart(
        symbol,
        resolution,
        from,
        to,
        countback,
      );

    this.addTrailingVolumesLeft(
      tradingPricesChartData,
      tradingVolumesChartData,
    );

    return {
      ...tradingPricesChartData,
      v: tradingVolumesChartData.v,
      s: 'ok',
    };
  }

  private addTrailingVolumesLeft(
    tradingPricesChartData: TradingPricesChartDto,
    tradingVolumesChartData: TradingVolumesChartDto,
  ): void {
    const missingVolumeElements =
      tradingPricesChartData.t.length - tradingVolumesChartData.t.length;

    for (let index = 0; index < missingVolumeElements; index += 1) {
      tradingVolumesChartData.v.unshift(0);
    }
  }
}
