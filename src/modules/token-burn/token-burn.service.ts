import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenBurn } from './entity/token-burn.entity';
import {
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { SearchOptionsDto } from './dto/search-request.dto';
import { TokenBurnDto } from './dto/token-burn.dto';
import { plainToInstance } from 'class-transformer';
import { TokenBurnSummaryDto } from './dto/token-burn-summary.dto';
import { XOR_ADDRESS } from 'src/constants/constants';
import {
  PageOptionsDto,
  PageWithSummaryDto,
  PageMetaDto,
} from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

export enum BurningToken {
  KENSETSU = 'kensetsu',
  KARMA = 'karma',
}

@Injectable()
export class TokenBurnService {
  private readonly logger = new Logger(TokenBurnService.name);

  private tokenBlockLimits = new Map<BurningToken, [string, string]>();

  constructor(
    @InjectRepository(TokenBurn)
    private readonly tokenBurnRepo: Repository<TokenBurn>,
  ) {
    this.tokenBlockLimits.set(BurningToken.KENSETSU, ['0', '14939187']);
    this.tokenBlockLimits.set(BurningToken.KARMA, ['14939188', '16056666']);
  }

  public async getTokenBurns(
    searchOptions: SearchOptionsDto,
    pageOptions: PageOptionsDto,
    token: BurningToken,
  ): Promise<PageWithSummaryDto<TokenBurnDto, TokenBurnSummaryDto>> {
    const queryBuilder = this.tokenBurnRepo.createQueryBuilder();

    this.addWhereClauses(queryBuilder, searchOptions, token);

    queryBuilder
      .orderBy('created_at', 'DESC')
      .skip(pageOptions.skip)
      .take(pageOptions.size);

    const [data, count] = await queryBuilder.getManyAndCount();
    const dtos = plainToInstance(TokenBurnDto, data, {
      excludeExtraneousValues: true,
    });

    const meta = new PageMetaDto(pageOptions.page, pageOptions.size, count);

    const amountBurnedTotal = await this.getAmountBurnedTotal(
      searchOptions,
      token,
    );

    return new PageWithSummaryDto(dtos, meta, { amountBurnedTotal });
  }

  private async getAmountBurnedTotal(
    searchOptions: SearchOptionsDto,
    token: BurningToken,
  ): Promise<number> {
    const queryBuilder = this.tokenBurnRepo
      .createQueryBuilder()
      .select('SUM(amount_burned)', 'amountBurnedTotal');

    this.addWhereClauses(queryBuilder, searchOptions, token);

    const { amountBurnedTotal } = await queryBuilder.getRawOne<{
      amountBurnedTotal: number;
    }>();

    return amountBurnedTotal || 0;
  }

  private addWhereClauses(
    queryBuilder: SelectQueryBuilder<TokenBurn>,
    searchOptions: SearchOptionsDto,
    token: BurningToken,
  ): void {
    queryBuilder
      .andWhere({ assetId: XOR_ADDRESS })
      .andWhere({
        blockNum: MoreThanOrEqual(this.tokenBlockLimits.get(token)[0]),
      })
      .andWhere({
        blockNum: LessThanOrEqual(this.tokenBlockLimits.get(token)[1]),
      });

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
  }
}
