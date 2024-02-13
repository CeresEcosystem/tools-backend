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

type WhereClause = {
  where: string;
  parameters: ObjectLiteral;
};

const TIME_FRAME = 5;

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

  async findSwapsForVolumes(i: number): Promise<SwapDto[]> {
    /**
     * dateFrom is the date from which we look to get swaps
     * dateTo is the date until which we look to get swaps

     * Lets say that we have 3 intervals, two to make up to and one regular - 19:20, 19:25, 19:30
      (last time volume was written to DB is 19:15)
        - for first interval, i will be 3:
           dateFrom: now - 3 * 5 or now - 15 will look for swaps starting from 15 minutes before
           dateTo: now - 3*5 -5, or now - 10 will look for swaps where the last swap is 10 minutes before
           so we get, for interval i=3 (19:20) swaps which are in the time between 19:15 and 19:20
     *  - for second interval, i will be 2, and the calculations are the same, it will look for swaps
          from 19:20 to 19: 25

        - As the last interval(regular one), dateTo will be 1 * 5 - 5 or 0, which leaves us just with
          now, so regular interval will look for swaps in between 5 minutes ago and now.
     */
    const dateFrom = new Date();
    const dateTo = new Date();
    dateFrom.setMinutes(dateFrom.getMinutes() - i * TIME_FRAME);
    dateTo.setMinutes(dateTo.getMinutes() - (i * TIME_FRAME - TIME_FRAME));

    const swaps = await this.swapRepository.find({
      where: {
        swappedAt: Between(dateFrom, dateTo),
      },
    });

    return swaps;
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
