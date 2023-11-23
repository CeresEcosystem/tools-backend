import { Controller, Get, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { PageDto } from 'src/utils/pagination/page.dto';
import { TransactionDto } from './dto/transactions.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('transactions')
@ApiTags('Transactions controller')
export class TransactionsController {
  constructor(private readonly txService: TransactionsService) {}

  @Get()
  public async getTransaction(
    @Query() pageOptions: PageOptionsDto,
    @Query('accountId') accountId: string,
  ): Promise<PageDto<TransactionDto>> {
    return this.txService.findTransactionsByAccountId(pageOptions, accountId);
  }
}
