import { BaseEntityMapper } from 'src/utils/mappers/base-entity-mapper';
import { CreateSymbolDto } from '../dto/create-symbol.dto';
import { TokenSymbol } from '../entity/symbol.entity';
import Big from 'big.js';

export class SymbolsMapper extends BaseEntityMapper<
  TokenSymbol,
  CreateSymbolDto
> {
  toEntity(dto: CreateSymbolDto): TokenSymbol {
    const { token, fullName, price } = dto;

    const priceScale = this.calculatePriceScale(price);

    return {
      id: token,
      name: token,
      description: fullName,
      ticker: token,
      priceScale,
    } as TokenSymbol;
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
