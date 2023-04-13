import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { TokenPriceBcDto } from './dto/token-price-bc.dto';
import { TokenPrice } from './entity/token-price.entity';
import { TokenPriceBcDtoToEntityMapper } from './mapper/token-price.mapper';
import { TokenPriceRepository } from './token-price.repository';
import { TokenOrder } from './entity/token-order.entity';
import { SymbolService } from '../symbol/symbol.service';
import { ChronoPriceService } from '../chrono-price/chrono-price.service';
import { ChronoPriceDto } from '../chrono-price/dto/chrono-price.dto';

@Injectable()
export class TokenPriceService {
  private readonly logger = new Logger(TokenPriceService.name);

  constructor(
    private readonly tokenPriceRepository: TokenPriceRepository,
    @InjectRepository(TokenOrder)
    private readonly tokenOrderRepository: Repository<TokenOrder>,
    private readonly mapper: TokenPriceBcDtoToEntityMapper,
    private readonly symbolService: SymbolService,
    private readonly chronoPriceService: ChronoPriceService,
  ) {}

  public findAll(): Promise<TokenPrice[]> {
    return this.tokenPriceRepository.findAll();
  }

  public findByToken(token: string): Promise<TokenPrice> {
    return this.tokenPriceRepository.findOneByOrFail({ token });
  }

  public async save(tokenPriceDtos: TokenPriceBcDto[]): Promise<void> {
    const tokenPrices = this.mapper.toEntities(tokenPriceDtos);
    const { tokenOrderBySymbol, defaultOrder } = await this.getTokenOrder();

    tokenPrices.forEach((tokenPrice) => {
      const { token, price, fullName } = tokenPrice;
      tokenPrice.order = tokenOrderBySymbol[token] ?? defaultOrder;

      this.symbolService.createSymbolIfMissing({ token, fullName, price });
    });

    this.tokenPriceRepository.upsertAll(tokenPrices);
    this.saveChronoPrices(tokenPrices);
  }

  public update(tokenPrice: TokenPrice): void {
    this.tokenPriceRepository.update(tokenPrice);
  }

  public searchByFullNameTerms(searchTerms: string[]): Promise<TokenPrice[]> {
    const whereStatements = searchTerms.map(
      (term) =>
        ({
          fullName: Like('%' + term + '%'),
          deleted: false,
        } as FindOptionsWhere<TokenPrice>),
    );

    return this.tokenPriceRepository.find({
      where: whereStatements,
      order: { order: 'asc' },
    });
  }

  private async getTokenOrder() {
    const tokenOrders = await this.tokenOrderRepository.find();
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

  private saveChronoPrices(tokenPrices: TokenPrice[]) {
    const chronoPrices = tokenPrices.map(
      (tokenPrice) =>
        ({
          token: tokenPrice.token,
          price: tokenPrice.price,
        } as ChronoPriceDto),
    );

    this.chronoPriceService.save(chronoPrices);
  }
}
