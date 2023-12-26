import { Controller, Get, Query } from '@nestjs/common';
import { TokenHoldersService } from './token-holders.service';
import { PageDto } from 'src/utils/pagination/page.dto';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { ApiTags } from '@nestjs/swagger';
import { HolderDto } from './dto/holder.dto';

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
