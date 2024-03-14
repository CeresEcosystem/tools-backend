import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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
import { SoraClient } from '../sora-client/sora-client';
import { PairLiquidityProviderDto } from './dto/pair-liquidity-provider.dto';

@Injectable()
export class PairsLiquidityService {
  private readonly logger = new Logger(PairsLiquidityService.name);

  constructor(
    private readonly repository: PairsLiquidityRepository,
    private readonly mapper: PairLiquidityChangeEntityToDtoMapper,
    private readonly periodicMapper: PairPeriodicLiquidityChangeEntityToDtoMapper,
    private readonly periodicLiqChangeRepo: PairsPeriodicLiquidityChangeRepository,
    private readonly pairsService: PairsService,
    private readonly soraClient: SoraClient,
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

  public async getLiquidityProviders(
    baseAsset: string,
    tokenAsset: string,
  ): Promise<PairLiquidityProviderDto[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const soraApi: any = await this.soraClient.getSoraApi();

    const liquidityProviders: PairLiquidityProviderDto[] = [];

    try {
      const [poolAddress] = (
        await soraApi.query.poolXYK.properties(baseAsset, tokenAsset)
      ).toHuman();

      const pairData = await this.pairsService.findOneByAssetIds(
        baseAsset,
        tokenAsset,
      );

      const poolProviders = await soraApi.query.poolXYK.poolProviders.entries(
        poolAddress,
      );

      const totalLiquidity = await soraApi.query.poolXYK.totalIssuances(
        poolAddress,
      );

      for (const [liquidityProvider, lpTokens] of poolProviders) {
        const provider = liquidityProvider.toHuman();

        liquidityProviders.push({
          address: provider[1],
          liquidity: (lpTokens / totalLiquidity) * pairData.liquidity,
        });
      }

      liquidityProviders.sort(
        (
          providerA: PairLiquidityProviderDto,
          providerB: PairLiquidityProviderDto,
        ) => providerB.liquidity - providerA.liquidity,
      );
    } catch (_) {
      throw new BadRequestException('Invalid asset id.');
    }

    return liquidityProviders;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async updatePairsLiquidity(): Promise<void> {
    this.logger.log('Start updating pairs liquidity');

    const pairs = await this.pairsService.findAll();

    const relevantPairs = pairs.filter((pair) => pair.liquidity > 200);

    relevantPairs.forEach((pair) => {
      const pairLiqChange = new PairPeriodicLiquidityChangeEntity();
      pairLiqChange.baseAssetSymbol = pair.baseAsset;
      pairLiqChange.tokenAssetSymbol = pair.token;
      pairLiqChange.baseAssetLiq = pair.baseAssetLiq;
      pairLiqChange.tokenAssetLiq = pair.targetAssetLiq;
      pairLiqChange.liquidity = pair.liquidity;
      pairLiqChange.updatedAt = new Date();
      this.periodicLiqChangeRepo.savePeriodicLiqChange(pairLiqChange);
    });

    this.logger.log('Updating pairs liquidity successful');
  }
}
