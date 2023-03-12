import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Big } from 'big.js';
import { Repository } from 'typeorm';
import { TokenSymbol } from '../symbol/symbol.entity';
import { SymbolMapper } from './create-symbol-to-entity.mapper';
import { CreateSymbolDto } from './create-symbol.dto';

@Injectable()
export class SymbolService {
  private readonly logger = new Logger(SymbolService.name);

  constructor(
    @InjectRepository(TokenSymbol)
    private readonly symbolRepository: Repository<TokenSymbol>,
    private readonly symbolMapper: SymbolMapper,
  ) {}

  public findOneOrFail(id: string): Promise<TokenSymbol> {
    return this.symbolRepository.findOneByOrFail({ id });
  }

  public async createSymbolIfMissing(newSymbol: CreateSymbolDto) {
    const symbolExists = await this.symbolRepository.exist({
      where: { id: newSymbol.token },
    });

    if (!symbolExists) {
      this.create(newSymbol);
    }
  }

  private async create(newSymbol: CreateSymbolDto) {
    this.logger.log(
      `Creating new Symbol: ${newSymbol.token}, \
       price: ${newSymbol.price}`,
    );

    const symbol = this.symbolMapper.toEntity(newSymbol);

    symbol.pricescale = this.calculatePriceScale(newSymbol.price);

    await this.symbolRepository.insert(symbol);

    this.logger.log(
      `Created new Symbol: ${symbol.id}, \
       price: ${newSymbol.price}, \
       pricescale: ${symbol.pricescale}`,
    );
  }

  private calculatePriceScale(price: string): number {
    let scale = new Big(100);
    let priceNum = new Big(price);

    if (priceNum.eq(0)) {
      return scale.toNumber();
    }

    while (priceNum.lt(0.1)) {
      scale = scale.times(10);
      priceNum = priceNum.times(10);
    }

    return scale.toNumber();
  }
}
