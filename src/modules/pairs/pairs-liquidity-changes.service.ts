import { Injectable } from '@nestjs/common';
import { PairLiquidityChangeEntity } from './entity/pair-liquidity-change.entity';
import { PairsLiquidityChangesRepository } from './pairs-liquidity-changes.repository';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { PageMetaDto } from 'src/utils/pagination/page-meta.dto';
import { PageDto } from 'src/utils/pagination/page.dto';
import { PairsLiquidityEntityToDtoMapper } from './mapper/pair-liquidity-entity-to-dto.mapper';

@Injectable()
export class PairsLiquidityChangesService {
  constructor(
    private readonly repository: PairsLiquidityChangesRepository,
    private readonly mapper: PairsLiquidityEntityToDtoMapper,
  ) {}

  public insert(data: PairLiquidityChangeEntity) {
    this.repository.insert(data);
  }

  public async find(
    assetA: string,
    assetB: string,
    pageOptions: PageOptionsDto,
  ) {
    const [data, count] = await this.repository.findAndCount(
      assetA,
      assetB,
      pageOptions,
    );

    const pageMeta = new PageMetaDto(pageOptions.page, pageOptions.size, count);

    return new PageDto(this.mapper.toDtos(data), pageMeta);
  }
}
