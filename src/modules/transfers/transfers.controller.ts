import { Controller, Get, Query } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { PageDto } from 'src/utils/pagination/page.dto';
import { TransferDto } from './dto/transfer.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('transfers')
@ApiTags('Transfers controller')
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Get()
  public async getTransfers(
    @Query() pageOptions: PageOptionsDto,
    @Query('accountId') accountId: string,
  ): Promise<PageDto<TransferDto>> {
    return this.transfersService.findTransfersByAccountId(
      pageOptions,
      accountId,
    );
  }
}
