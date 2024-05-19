import { Controller, Get, Query } from '@nestjs/common';
import { TokenHoldersService } from './token-holders.service';
import { ApiTags } from '@nestjs/swagger';
import { HolderDto } from './dto/holder.dto';
import {
  PageOptionsDto,
  PageDto,
} from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@ApiTags('Holders controller')
@Controller('/holders')
export class TokenHoldersController {
  constructor(private readonly tokenHolderService: TokenHoldersService) {}

  @Get()
  public getHoldersAndBalances(
    @Query() pageOptions: PageOptionsDto,
    @Query('assetId') assetId: string,
  ): Promise<PageDto<HolderDto>> {
    return this.tokenHolderService.getHoldersAndBalances(pageOptions, assetId);
  }
}
