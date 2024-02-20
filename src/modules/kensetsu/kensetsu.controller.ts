import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { SearchOptionsDto } from './dto/search-request.dto';
import { KensetsuService } from './kensetsu.service';
import { KensetsuBurnDto } from './dto/kensetsu-burn.dto';
import { PageWithSummaryDto } from 'src/utils/pagination/page-with-summary.dto';
import { KensetsuBurnSummaryDto } from './dto/kensetsu-burn-summary.dto';

@Controller('kensetsu')
@ApiTags('Kensetsu Controller')
export class KensetsuController {
  constructor(private readonly kensetsuService: KensetsuService) {}

  @Get('/burns')
  public getKensetsuBurns(
    @Query() searchOptions: SearchOptionsDto,
    @Query() pageOptions: PageOptionsDto,
  ): Promise<PageWithSummaryDto<KensetsuBurnDto, KensetsuBurnSummaryDto>> {
    return this.kensetsuService.getKensetsuBurns(searchOptions, pageOptions);
  }
}
