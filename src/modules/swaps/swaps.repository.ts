import { Injectable } from '@nestjs/common';
import {
  LessThan,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
  Between,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Swap } from './entity/swaps.entity';
import { SwapDto } from './dto/swap.dto';
import { SwapEntityToDto } from './mapper/swap-entity-to-dto.mapper';
import { PageDto } from 'src/utils/pagination/page.dto';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { PageMetaDto } from 'src/utils/pagination/page-meta.dto';
import {
  getDateOneMonthBefore,
  isAfter,
  isBefore,
  subtractDays,
} from 'src/utils/date-utils';
import { SwapOptionsDto } from './dto/swap-options.dto';
import { SwapsStatsDto } from './dto/swaps-stats.dto';
import { PageWithSummaryDto } from 'src/utils/pagination/page-with-summary.dto';

type WhereClause = {
  where: string;
  parameters: ObjectLiteral;
};

@Injectable()
export class SwapRepository {
  constructor(
    @InjectRepository(Swap)
    private readonly swapRepository: Repository<Swap>,
    private readonly swapMapper: SwapEntityToDto,
  ) {}

  public async findAllSwaps(
    pageOptions: PageOptionsDto,
    swapOptions: SwapOptionsDto,
  ): Promise<PageDto<SwapDto>> {
    const queryBuilder: SelectQueryBuilder<Swap> =
      this.swapRepository.createQueryBuilder('swap');

    const whereClauses = this.getWhereClauses(swapOptions);

    whereClauses.forEach((whereClause) => {
      queryBuilder.andWhere(whereClause.where, whereClause.parameters);
    });

    queryBuilder.orderBy({ 'swap.id': swapOptions.orderBy });
    queryBuilder.skip(pageOptions.skip).take(pageOptions.size);

    const [data, count] = await queryBuilder.getManyAndCount();

    const meta = new PageMetaDto(pageOptions.page, pageOptions.size, count);

    return new PageDto(this.swapMapper.toDtos(data), meta);
  }

  public async findSwapsForPeriod(from: Date, to: Date): Promise<SwapDto[]> {
    const swaps = await this.swapRepository.findBy({
      swappedAt: Between(from, to),
    });

    return swaps;
  }

  public async findSwapsByAssetIds(
    pageOptions: PageOptionsDto,
    swapOptions: SwapOptionsDto,
    assetIds: string[],
  ): Promise<PageWithSummaryDto<SwapDto, SwapsStatsDto>> {
    const queryBuilder: SelectQueryBuilder<Swap> =
      this.swapRepository.createQueryBuilder('swap');

    queryBuilder.where(
      '(swap.inputAssetId IN (:...assetIds) OR swap.outputAssetId IN (:...assetIds))',
      { assetIds },
    );

    const whereClauses = this.getWhereClauses(swapOptions, assetIds);

    whereClauses.forEach((whereClause) => {
      queryBuilder.andWhere(whereClause.where, whereClause.parameters);
    });

    queryBuilder.orderBy({ 'swap.id': swapOptions.orderBy });

    let swapsStats = new SwapsStatsDto();

    if (assetIds.length === 1) {
      swapsStats = await this.getSwapStats(queryBuilder, assetIds[0]);
    }

    queryBuilder.skip(pageOptions.skip).take(pageOptions.size);

    const [data, count] = await queryBuilder.getManyAndCount();

    const meta = new PageMetaDto(pageOptions.page, pageOptions.size, count);

    return new PageWithSummaryDto(
      this.swapMapper.toDtos(data),
      meta,
      swapsStats,
    );
  }

  public async findSwapsByAccountId(
    pageOptions: PageOptionsDto,
    accountId: string,
  ): Promise<PageDto<SwapDto>> {
    const [data, count] = await this.swapRepository.findAndCount({
      skip: pageOptions.skip,
      take: pageOptions.size,
      order: { id: 'DESC' },
      where: { accountId },
    });

    const meta = new PageMetaDto(pageOptions.page, pageOptions.size, count);

    return new PageDto(this.swapMapper.toDtos(data), meta);
  }

  public async deleteOlderThanDays(days: number): Promise<void> {
    await this.swapRepository.delete({
      swappedAt: LessThan(subtractDays(new Date(), days)),
    });
  }

  private getWhereClauses(
    swapOptions: SwapOptionsDto,
    assetIds?: string[],
  ): WhereClause[] {
    const whereClause: WhereClause[] = [];

    if (swapOptions.dateFrom || swapOptions.dateTo) {
      whereClause.push(
        this.validateDates(swapOptions.dateFrom, swapOptions.dateTo),
      );
    }

    if (swapOptions.assetId) {
      whereClause.push({
        where: '(swap.inputAssetId = :token OR swap.outputAssetId = :token)',
        parameters: { token: swapOptions.assetId },
      });
    }

    if (swapOptions.excludedAccIds) {
      whereClause.push({
        where: 'swap.accountId NOT IN (:accountIds)',
        parameters: { accountIds: swapOptions.excludedAccIds },
      });
    }

    whereClause.push(this.getAmountWhereClause(swapOptions, assetIds));

    return whereClause;
  }

  private getAmountWhereClause(
    swapOptions: SwapOptionsDto,
    assetIds?: string[],
  ): WhereClause {
    const queryForMultipleTokens = !assetIds || assetIds?.length > 1;

    if (queryForMultipleTokens) {
      return {
        where: `((swap.assetInputAmount >= :minAmount AND swap.assetInputAmount <= :maxAmount) 
        OR (swap.assetOutputAmount >= :minAmount AND swap.assetOutputAmount <= :maxAmount))`,
        parameters: {
          minAmount: swapOptions.minAmount,
          maxAmount: swapOptions.maxAmount,
        },
      };
    }

    return {
      where: `((swap.inputAssetId = :assetId 
        AND swap.assetInputAmount >= :minAmount AND swap.assetInputAmount <= :maxAmount)
      OR (swap.outputAssetId = :assetId 
        AND swap.assetOutputAmount >= :minAmount AND swap.assetOutputAmount <= :maxAmount))`,
      parameters: {
        assetId: assetIds[0],
        minAmount: swapOptions.minAmount,
        maxAmount: swapOptions.maxAmount,
      },
    };
  }

  private validateDates(dateFrom?: Date, dateTo?: Date): WhereClause {
    const dateFromCondition =
      dateFrom && isAfter(dateFrom, getDateOneMonthBefore())
        ? 'swap.swappedAt >= :dateFrom'
        : '';
    const dateToCondition =
      dateTo && isBefore(dateTo, new Date()) ? 'swap.swappedAt <= :dateTo' : '';

    return {
      where: [dateFromCondition, dateToCondition].filter(Boolean).join(' AND '),
      parameters: {
        dateFrom,
        dateTo,
      },
    };
  }

  private async getSwapStats(
    queryBuilder: SelectQueryBuilder<Swap>,
    assetId: string,
  ): Promise<SwapsStatsDto> {
    const buyQuery = queryBuilder
      .clone()
      .select('SUM(swap.assetOutputAmount) AS tokensBought')
      .addSelect('COUNT(*) AS buys')
      .andWhere('swap.outputAssetId = :assetId', {
        assetId,
      });

    const sellQuery = queryBuilder
      .clone()
      .select('SUM(swap.assetInputAmount) AS tokensSold')
      .addSelect('COUNT(*) AS sells')
      .andWhere('swap.inputAssetId = :assetId', {
        assetId,
      });

    const [buyResult, sellResult] = await Promise.all([
      await buyQuery.getRawOne(),
      await sellQuery.getRawOne(),
    ]);

    return {
      buys: parseInt(buyResult.buys) || 0,
      tokensBought: buyResult.tokensBought || 0,
      sells: parseInt(sellResult.sells) || 0,
      tokensSold: sellResult.tokensSold || 0,
    };
  }
}
