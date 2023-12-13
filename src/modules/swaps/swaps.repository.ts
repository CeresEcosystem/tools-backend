import { Injectable } from '@nestjs/common';
import { LessThan, Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Swap } from './entity/swaps.entity';
import { SwapDto } from './dto/swap.dto';
import { SwapEntityToDto } from './mapper/swap-entity-to-dto.mapper';
import { PageDto } from 'src/utils/pagination/page.dto';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { PageMetaDto } from 'src/utils/pagination/page-meta.dto';
import { subtractDays } from 'src/utils/date-utils';
import { SwapOptionsDto } from './dto/swap-options.dto';

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

    if (swapOptions.whereClauses.length > 0) {
      swapOptions.whereClauses.forEach((whereClause) => {
        queryBuilder.andWhere(whereClause.where, whereClause.parameters);
      });
    }

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

    if (swapOptions.whereClauses.length > 0) {
      swapOptions.whereClauses.forEach((whereClause) => {
        queryBuilder.andWhere(whereClause.where, whereClause.parameters);
      });
    }

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
}
