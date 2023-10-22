import { Injectable } from '@nestjs/common';
import { FindOptionsWhere, Like } from 'typeorm';
import { TokenPriceBcDto } from './dto/token-price-bc.dto';
import { TokenPrice } from './entity/token-price.entity';
import { TokenPriceBcDtoToEntityMapper } from './mapper/token-price.mapper';
import { TokenPriceRepository } from './token-price.repository';
import { SymbolsService } from '../symbols/symbols.service';
import { ChronoPriceService } from '../chrono-price/chrono-price.service';
import { ChronoPriceDto } from '../chrono-price/dto/chrono-price.dto';
import { TokenOrderService } from '../token-order/token-order.service';

@Injectable()
export class TokenPriceService {
  constructor(
    private readonly tokenPriceRepository: TokenPriceRepository,
    private readonly tokenOrderService: TokenOrderService,
    private readonly mapper: TokenPriceBcDtoToEntityMapper,
    private readonly symbolsService: SymbolsService,
    private readonly chronoPriceService: ChronoPriceService,
  ) {}

  public findAll(): Promise<TokenPrice[]> {
    return this.tokenPriceRepository.findAll();
  }

  public findByToken(token: string): Promise<TokenPrice> {
    return this.tokenPriceRepository.findOneByOrFail({ token });
  }

  public findByAssetId(assetId: string): Promise<TokenPrice> {
    return this.tokenPriceRepository.findOneBy({ assetId });
  }

  public async save(tokenPriceDtos: TokenPriceBcDto[]): Promise<void> {
    const tokenPrices = this.mapper.toEntities(tokenPriceDtos);
    const { tokenOrderBySymbol, defaultOrder } =
      await this.tokenOrderService.getTokenOrder();

    tokenPrices.forEach((tokenPrice) => {
      const { token, price, fullName } = tokenPrice;
      tokenPrice.order = tokenOrderBySymbol[token] ?? defaultOrder;

      this.symbolsService.createSymbolIfMissing({ token, fullName, price });
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
