import { Injectable } from '@nestjs/common';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { PageDto } from 'src/utils/pagination/page.dto';
import { TransactionDto } from './dto/transactions.dto';
import { TransactionsRepository } from './transactions.repository';

@Injectable()
export class TransactionsService {
  constructor(private readonly txRepo: TransactionsRepository) {}

  public async findTransactionsByAccountId(
    pageOptions: PageOptionsDto,
    accountId: string,
  ): Promise<PageDto<TransactionDto>> {
    return await this.txRepo.findTxsByAccountId(pageOptions, accountId);
  }
}
