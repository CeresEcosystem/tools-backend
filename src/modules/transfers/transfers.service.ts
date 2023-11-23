import { Injectable } from '@nestjs/common';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { PageDto } from 'src/utils/pagination/page.dto';
import { TransferDto } from './dto/transfer.dto';
import { TransfersRepository } from './transfers.repository';

@Injectable()
export class TransfersService {
  constructor(private readonly transfersRepo: TransfersRepository) {}

  public async findTransfersByAccountId(
    pageOptions: PageOptionsDto,
    accountId: string,
  ): Promise<PageDto<TransferDto>> {
    return await this.transfersRepo.findTransfersByAccountId(
      pageOptions,
      accountId,
    );
  }
}
