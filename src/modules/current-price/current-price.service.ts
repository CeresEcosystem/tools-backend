import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { CurrentPriceBcDto } from './dto/current-price-bc.dto';
import { CurrentPrice } from './entity/current-price.entity';
import { CurrentPriceBcDtoToEntityMapper } from './mapper/current-price.mapper';
import { CurrentPriceRepository } from './current-price.repository';
import { TokenOrder } from './entity/token-order.entity';
import { SymbolService } from '../symbol/symbol.service';
import { ChronoPriceService } from '../chrono-price/chrono-price.service';
import { ChronoPriceDto } from '../chrono-price/dto/chrono-price.dto';

@Injectable()
export class CurrentPriceService {
  private readonly logger = new Logger(CurrentPriceService.name);

  constructor(
    private readonly currentPriceRepository: CurrentPriceRepository,
    @InjectRepository(TokenOrder)
    private readonly tokenOrderRepository: Repository<TokenOrder>,
    private readonly mapper: CurrentPriceBcDtoToEntityMapper,
    private readonly symbolService: SymbolService,
    private readonly chronoPriceService: ChronoPriceService,
  ) {}

  public findAll(): Promise<CurrentPrice[]> {
    return this.currentPriceRepository.findAll();
  }

  public findByToken(token: string): Promise<CurrentPrice> {
    return this.currentPriceRepository.findOneByOrFail({ token });
  }

  public async save(currentPriceDtos: CurrentPriceBcDto[]): Promise<void> {
    const currentPrices = this.mapper.toEntities(currentPriceDtos);
    const { tokenOrderBySymbol, defaultOrder } = await this.getTokenOrder();

    currentPrices.forEach((tokenPrice) => {
      const { token, price, fullName } = tokenPrice;
      tokenPrice.order = tokenOrderBySymbol[token] ?? defaultOrder;

      this.symbolService.createSymbolIfMissing({ token, fullName, price });
    });

    this.currentPriceRepository.upsertAll(currentPrices);
    this.saveChronoPrices(currentPrices);
  }

  public searchByFullNameTerms(searchTerms: string[]): Promise<CurrentPrice[]> {
    const whereStatements = searchTerms.map(
      (term) =>
        ({
          fullName: Like('%' + term + '%'),
          deleted: false,
        } as FindOptionsWhere<CurrentPrice>),
    );

    return this.currentPriceRepository.find({
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

  private saveChronoPrices(currentPrices: CurrentPrice[]) {
    const chronoPrices = currentPrices.map(
      (currentPrice) =>
        ({
          token: currentPrice.token,
          price: currentPrice.price,
        } as ChronoPriceDto),
    );

    this.chronoPriceService.save(chronoPrices);
  }
}
