import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KensetsuBurn } from './entity/kensetsu-burn.entity';
import {
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { SearchOptionsDto } from './dto/search-request.dto';
import { PageDto } from 'src/utils/pagination/page.dto';
import { KensetsuBurnDto } from './dto/kensetsu-burn.dto';
import { PageMetaDto } from 'src/utils/pagination/page-meta.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class KensetsuService {
  private readonly logger = new Logger(KensetsuService.name);

  constructor(
    @InjectRepository(KensetsuBurn)
    private readonly kensetsuRepo: Repository<KensetsuBurn>,
  ) {}

  public async getKensetsuBurns(
    searchOptions: SearchOptionsDto,
    pageOptions: PageOptionsDto,
  ): Promise<PageDto<KensetsuBurnDto>> {
    const queryBuilder: SelectQueryBuilder<KensetsuBurn> =
      this.kensetsuRepo.createQueryBuilder();

    if (searchOptions.accountId) {
      queryBuilder.andWhere({ accountId: searchOptions.accountId });
    }

    if (searchOptions.dateFrom) {
      queryBuilder.andWhere({
        createdAt: MoreThanOrEqual(searchOptions.dateFrom),
      });
    }

    if (searchOptions.dateTo) {
      queryBuilder.andWhere({
        createdAt: LessThanOrEqual(searchOptions.dateTo),
      });
    }

    queryBuilder
      .orderBy('created_at', 'DESC')
      .skip(pageOptions.skip)
      .take(pageOptions.size);

    const [data, count] = await queryBuilder.getManyAndCount();

    const meta = new PageMetaDto(pageOptions.page, pageOptions.size, count);

    const dtos = data.map((element) =>
      plainToInstance(KensetsuBurnDto, element, {
        excludeExtraneousValues: true,
      }),
    );

    return new PageDto(dtos, meta);
  }
}
