import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transfer } from './entity/transfer.entity';
import { TransferEntityToDto } from './mapper/transfer-entity-to-dto.mapper';
import { TransferDto } from './dto/transfer.dto';
import {
  PageOptionsDto,
  PageDto,
  PageMetaDto,
} from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Injectable()
export class TransfersRepository {
  constructor(
    @InjectRepository(Transfer)
    private readonly transferRepository: Repository<Transfer>,
    private readonly transferMapper: TransferEntityToDto,
  ) {}

  public saveTransfer(tx: Transfer): Promise<Transfer> {
    return this.transferRepository.save(tx);
  }

  public async findTransfersByAccountId(
    pageOptions: PageOptionsDto,
    accountId: string,
  ): Promise<PageDto<TransferDto>> {
    const [data, count] = await this.transferRepository.findAndCount({
      skip: pageOptions.skip,
      take: pageOptions.size,
      order: { id: 'DESC' },
      where: [{ senderAccountId: accountId }, { receiverAccountId: accountId }],
    });
    const meta = new PageMetaDto(pageOptions.page, pageOptions.size, count);

    return new PageDto(this.transferMapper.toDtos(data), meta);
  }
}
