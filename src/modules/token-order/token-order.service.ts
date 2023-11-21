import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenOrder } from './entity/token-order.entity';
import { PageDto } from 'src/utils/pagination/page.dto';
import { PageMetaDto } from 'src/utils/pagination/page-meta.dto';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { TokenOrderToDtoMapper } from './mapper/to-dto.mapper';
import { UpsertTokenOrderDto } from './dto/upsert-token-order.dto';
import { TokenOrderDto } from './dto/token-order.dto';

@Injectable()
export class TokenOrderService {
  constructor(
    @InjectRepository(TokenOrder)
    private readonly tokenOrderRepo: Repository<TokenOrder>,
    private readonly toDtoMapper: TokenOrderToDtoMapper,
  ) {}

  public async getTokenOrder(): Promise<{
    tokenOrderBySymbol: { [key: string]: number };
    defaultOrder: number;
  }> {
    const tokenOrders = await this.tokenOrderRepo.find();
    const lastOrder =
      tokenOrders.length > 0
        ? Math.max(...tokenOrders.map((tokenOrder) => tokenOrder.order))
        : 0;

    const defaultOrder = lastOrder + 1;
    const tokenOrderBySymbol = Object.fromEntries(
      tokenOrders.map((tokenOrder) => [tokenOrder.symbol, tokenOrder.order]),
    );

    return {
      tokenOrderBySymbol,
      defaultOrder,
    };
  }

  public async findAll(
    pageOptions: PageOptionsDto,
  ): Promise<PageDto<TokenOrderDto>> {
    const [data, totalCount] = await this.tokenOrderRepo.findAndCount({
      skip: pageOptions.skip,
      take: pageOptions.size,
      order: { order: 'ASC' },
    });

    const pageMeta = new PageMetaDto(
      pageOptions.page,
      pageOptions.size,
      totalCount,
    );

    return new PageDto(this.toDtoMapper.toDtos(data), pageMeta);
  }

  public upsert(tokenOrderDto: UpsertTokenOrderDto): Promise<TokenOrder> {
    return this.tokenOrderRepo.save(tokenOrderDto);
  }

  public async delete(symbol: string): Promise<void> {
    await this.tokenOrderRepo.delete({ symbol });
  }
}
