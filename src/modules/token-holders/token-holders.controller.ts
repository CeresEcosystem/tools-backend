import { Controller, Get, Query } from '@nestjs/common';
import { TokenHoldersService } from './token-holders.service';
import { PageDto } from 'src/utils/pagination/page.dto';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { ApiTags } from '@nestjs/swagger';
import { TokenHoldersDto } from './dto/token-holders.dto';

@ApiTags('Holders controller')
@Controller('/holders')
export class TokenHoldersController {
  constructor(private readonly tokenHolderService: TokenHoldersService) {}

  @Get()
  public getHolders(
    @Query() pageOptions: PageOptionsDto,
    @Query('assetId') assetId: string,
  ): Promise<PageDto<TokenHoldersDto>> {
    return this.tokenHolderService.getTokenHoldersPaginated(
      pageOptions,
      assetId,
    );
  }
}
