import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Swap } from './entity/swaps.entity';
import { SwapDto } from './dto/swap.dto';

import { PageDto } from 'src/utils/pagination/page.dto';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { PageMetaDto } from 'src/utils/pagination/page-meta.dto';

@Injectable()
export class SwapRepository {
  constructor(
    @InjectRepository(Swap)
    private readonly swapRepository: Repository<Swap>,
  ) {}

  async findSwapsByAssetId(
    pageOptions: PageOptionsDto,
    assetId: string,
  ): Promise<PageDto<SwapDto>> {
    const [data, count] = await this.swapRepository.findAndCount({
      skip: pageOptions.skip,
      take: pageOptions.size,
      order: { id: 'DESC' },
      where: [{ inputAssetId: assetId }, { outputAssetId: assetId }],
    });

    const meta = new PageMetaDto(pageOptions.page, pageOptions.size, count);

    return new PageDto(data, meta);
  }
}
