import { Injectable } from '@nestjs/common';
import { TransferDto } from './dto/transfer.dto';
import { TransfersRepository } from './transfers.repository';
import {
  PageDto,
  PageOptionsDto,
} from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Injectable()
export class TransfersService {
  constructor(private readonly transfersRepo: TransfersRepository) {}

  public findTransfersByAccountId(
    pageOptions: PageOptionsDto,
    accountId: string,
  ): Promise<PageDto<TransferDto>> {
    return this.transfersRepo.findTransfersByAccountId(pageOptions, accountId);
  }
}
