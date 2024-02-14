import { Injectable } from '@nestjs/common';
import {
  LessThan,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
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

  async findAllSwaps(
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

  async findSwapsByAssetIds(
    pageOptions: PageOptionsDto,
    swapOptions: SwapOptionsDto,
    assetIds: string[],
  ): Promise<PageDto<SwapDto>> {
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
    queryBuilder.skip(pageOptions.skip).take(pageOptions.size);

    const [data, count] = await queryBuilder.getManyAndCount();

    const meta = new PageMetaDto(pageOptions.page, pageOptions.size, count);

    return new PageDto(this.swapMapper.toDtos(data), meta);
  }

  async findSwapsByAccountId(
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

    if (swapOptions.accountIds) {
      whereClause.push({
        where: 'swap.accountId NOT IN (:accountIds)',
        parameters: { accountIds: swapOptions.accountIds },
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
}
