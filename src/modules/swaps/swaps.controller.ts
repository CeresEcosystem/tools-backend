import { Controller, Get, Param, Query } from '@nestjs/common';
import { SwapRepository } from './swaps.repository';
import { PageDto } from 'src/utils/pagination/page.dto';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { SwapDto } from './dto/swap.do';
import { DbConnectionService } from './db-connection.service';

@Controller('swaps')
export class SwapsController {
  constructor(
    private swapRepo: SwapRepository,
    private swapDatabase: DbConnectionService,
  ) {}

  @Get('row')
  getSwaps() {
    return this.swapDatabase.watchDatabaseChanges();
  }

  @Get(':assetId')
  async findAll(
    @Query() pageOptions: PageOptionsDto,
    @Param('assetId') assetId: string,
  ): Promise<PageDto<SwapDto>> {
    return this.swapRepo.findSwapsByAssetId(pageOptions, assetId);
  }
}
