import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './entity/transactions.entity';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { PageMetaDto } from 'src/utils/pagination/page-meta.dto';
import { PageDto } from 'src/utils/pagination/page.dto';
import { TransactionEntityToDto } from './mapper/tx-entity-to-dto.mapper';
import { TransactionDto } from './dto/transactions.dto';

@Injectable()
export class TransactionsRepository {
  constructor(
    @InjectRepository(Transaction)
    private readonly txRepository: Repository<Transaction>,
    private readonly txMapper: TransactionEntityToDto,
  ) {}

  public async saveTransaction(tx: Transaction): Promise<Transaction> {
    return this.txRepository.save(tx);
  }

  public async findTxsByAccountId(
    pageOptions: PageOptionsDto,
    accountId: string,
  ): Promise<PageDto<TransactionDto>> {
    const [data, count] = await this.txRepository.findAndCount({
      skip: pageOptions.skip,
      take: pageOptions.size,
      order: { id: 'DESC' },
      where: [{ senderAccId: accountId }, { receiverAccId: accountId }],
    });
    const meta = new PageMetaDto(pageOptions.page, pageOptions.size, count);
    return new PageDto(this.txMapper.toDtos(data), meta);
  }
}
