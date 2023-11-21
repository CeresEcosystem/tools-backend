import { Injectable } from '@nestjs/common';
import { PairLiquidityChangeEntity } from './entity/pair-liquidity-change.entity';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { PageMetaDto } from 'src/utils/pagination/page-meta.dto';
import { PageDto } from 'src/utils/pagination/page.dto';
import { PairsLiquidityRepository } from './pairs-liquidity.repository';
import { PairLiquidityChangeEntityToDtoMapper } from './mapper/pair-liquidity-change-entity-to-dto.mapper';
import { PairLiquidityChangeDto } from './dto/pair-liquidity-change.dto';

@Injectable()
export class PairsLiquidityService {
  constructor(
    private readonly repository: PairsLiquidityRepository,
    private readonly mapper: PairLiquidityChangeEntityToDtoMapper,
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
}
