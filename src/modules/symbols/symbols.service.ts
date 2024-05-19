import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenSymbol } from './entity/symbol.entity';
import { CreateSymbolDto } from './dto/create-symbol.dto';
import { SymbolAdminDto } from './dto/symbol-admin-dto';
import { SymbolsAdminMapper } from './mapper/symbol-to-admin-dto.mapper';
import { SymbolsMapper } from './mapper/create-symbol-to-entity.mapper';
import { UpdateSymbolDto } from './dto/update-symbol-dto';
import {
  PageOptionsDto,
  PageDto,
  PageMetaDto,
} from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Injectable()
export class SymbolsService {
  private readonly logger = new Logger(SymbolsService.name);

  constructor(
    @InjectRepository(TokenSymbol)
    private readonly symbolsRepo: Repository<TokenSymbol>,
    private readonly symbolsMapper: SymbolsMapper,
    private readonly symbolsAdminMapper: SymbolsAdminMapper,
  ) {}

  public async findAll(
    pageOptions: PageOptionsDto,
  ): Promise<PageDto<SymbolAdminDto>> {
    const [data, totalCount] = await this.symbolsRepo.findAndCount({
      skip: pageOptions.skip,
      take: pageOptions.size,
      order: { name: 'ASC' },
    });

    const pageMeta = new PageMetaDto(
      pageOptions.page,
      pageOptions.size,
      totalCount,
    );

    return new PageDto(this.symbolsAdminMapper.toDtos(data), pageMeta);
  }

  public findOneOrFail(id: string): Promise<TokenSymbol> {
    return this.symbolsRepo.findOneByOrFail({ id });
  }

  public async createSymbolIfMissing(
    newSymbol: CreateSymbolDto,
  ): Promise<void> {
    const symbolExists = await this.symbolsRepo.exist({
      where: { id: newSymbol.token },
    });

    if (!symbolExists) {
      this.create(newSymbol);
    }
  }

  private async create(newSymbol: CreateSymbolDto): Promise<void> {
    this.logger.log(
      `Creating new Symbol: ${newSymbol.token}, \
       price: ${newSymbol.price}`,
    );

    const symbol = this.symbolsMapper.toEntity(newSymbol);

    await this.symbolsRepo.insert(symbol);

    this.logger.log(
      `Created new Symbol: ${symbol.id}, \
       price: ${newSymbol.price}, \
       pricescale: ${symbol.priceScale}`,
    );
  }

  public async update(
    id: string,
    updateSymbolDto: UpdateSymbolDto,
  ): Promise<void> {
    if (!(await this.symbolsRepo.exist({ where: { id } }))) {
      throw new BadRequestException('Symbol does not exist.');
    }

    await this.symbolsRepo.update(id, updateSymbolDto);
  }
}
