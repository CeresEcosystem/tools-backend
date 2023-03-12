import { BaseEntityMapper } from 'src/utils/mappers/base-entity-mapper';
import { CreateSymbolDto } from './create-symbol.dto';
import { TokenSymbol } from './symbol.entity';

export class SymbolMapper extends BaseEntityMapper<
  TokenSymbol,
  CreateSymbolDto
> {
  toEntity(dto: CreateSymbolDto): TokenSymbol {
    return {
      id: dto.token,
      name: dto.token,
      description: dto.fullName,
      ticker: dto.token,
      hasDwm: false,
    } as TokenSymbol;
  }
}
