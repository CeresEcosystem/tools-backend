import { Injectable, Logger } from '@nestjs/common';
import { PairLiquidityChangeEntity } from './entity/pair-liquidity-change.entity';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { PageMetaDto } from 'src/utils/pagination/page-meta.dto';
import { PageDto } from 'src/utils/pagination/page.dto';
import { PairsLiquidityRepository } from './pairs-liquidity.repository';
import { PairLiquidityChangeEntityToDtoMapper } from './mapper/pair-liquidity-change-entity-to-dto.mapper';
import { PairLiquidityChangeDto } from './dto/pair-liquidity-change.dto';
import { PairsPeriodicLiquidityChangeRepository } from './periodic-liquidity-change.repository';
import { PairPeriodicLiquidityChangeEntityToDtoMapper } from './mapper/pair-periodic-liquidity-change-entity-to-dto';
import { PairPeriodicLiquidityChangeEntity } from './entity/pair-periodic-liquidity-change.entity';
import { PairsService } from '../pairs/pairs.service';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from 'src/utils/cron-expression.enum';
import { PairPeriodicLiquidityChangeDto } from './dto/pair-periodic-liquidity-change.dto';

@Injectable()
export class PairsLiquidityService {
  private readonly logger = new Logger(PairsLiquidityService.name);

  constructor(
    private readonly repository: PairsLiquidityRepository,
    private readonly mapper: PairLiquidityChangeEntityToDtoMapper,
    private readonly periodicMapper: PairPeriodicLiquidityChangeEntityToDtoMapper,
    private readonly periodicLiqChangeRepo: PairsPeriodicLiquidityChangeRepository,
    private readonly pairsService: PairsService,
  ) {}

  public insert(data: PairLiquidityChangeEntity): void {
    this.repository.insert(data);
  }

  public async find(
    assetA: string,
    assetB: string,
    pageOptions: PageOptionsDto,
  ): Promise<PageDto<PairLiquidityChangeDto>> {
    const [data, count] = await this.repository.findAndCount(
      assetA,
      assetB,
      pageOptions,
    );

    const pageMeta = new PageMetaDto(pageOptions.page, pageOptions.size, count);

    return new PageDto(this.mapper.toDtos(data), pageMeta);
  }

  public async getPeriodicChanges(
    baseAssetSymbol: string,
    tokenAssetSymbol: string,
  ): Promise<PairPeriodicLiquidityChangeDto[]> {
    const pairPeriodicChange =
      await this.periodicLiqChangeRepo.findPairPeriodicLiqChange(
        baseAssetSymbol,
        tokenAssetSymbol,
      );

    return this.periodicMapper.toDtos(pairPeriodicChange);
  }

  @Cron(CronExpression.EVERY_HOUR)
  private async updatePairsLiquidity(): Promise<void> {
    this.logger.log('Start updating pairs liquidity');

    const pairs = await this.pairsService.findAll();

    const relevantPairs = pairs.filter((pair) => pair.liquidity > 200);

    relevantPairs.forEach((pair) => {
      const pairLiqChange = new PairPeriodicLiquidityChangeEntity();
      pairLiqChange.baseAssetSymbol = pair.baseAsset;
      pairLiqChange.tokenAssetSymbol = pair.token;
      pairLiqChange.liquidity = pair.liquidity;
      pairLiqChange.updatedAt = new Date();
      this.periodicLiqChangeRepo.savePeriodcLiqChange(pairLiqChange);
    });

    this.logger.log('Updating pairs liquidity successful');
  }
}
