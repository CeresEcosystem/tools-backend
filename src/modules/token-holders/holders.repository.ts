import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Holder } from './entity/holders.entity';
import { Repository } from 'typeorm';
import { PageDto } from 'src/utils/pagination/page.dto';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { HolderDto } from './dto/holder.dto';
import { PageMetaDto } from 'src/utils/pagination/page-meta.dto';
import { HolderEntityToDto } from './mapper/holder-entity-to-dto.mapper';

@Injectable()
export class HoldersRepository {
  constructor(
    @InjectRepository(Holder) private holderRepo: Repository<Holder>,
    private holderMapper: HolderEntityToDto,
  ) {}

  public upsertHolder(holder: Holder): void {
    this.holderRepo.upsert(holder, ['holder', 'token']);
  }

  public async deleteHoldersWithZeroBalance(): Promise<void> {
    await this.holderRepo.delete({ balance: 0 });
  }

  public findAllHolders(): Promise<Holder[]> {
    return this.holderRepo.find();
  }

  public async findHoldersAndBalances(
    pageOptions: PageOptionsDto,
    token: string,
  ): Promise<PageDto<HolderDto>> {
    const [allHolders, count] = await this.holderRepo.findAndCount({
      skip: pageOptions.skip,
      take: pageOptions.size,
      order: {
        balance: 'DESC',
      },
      where: {
        token,
      },
    });

    const meta = new PageMetaDto(pageOptions.page, pageOptions.size, count);

    return new PageDto(this.holderMapper.toDtos(allHolders), meta);
  }
}
