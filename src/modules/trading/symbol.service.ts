import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository, FindOptionsWhere } from 'typeorm';
import { SymbolChartSearchDto } from './dto/symbol-chart-search.dto';
import { CurrentPrice } from './entities/current-price.entity';
import { TokenSymbol } from './entities/symbol.entity';
import { CurrentPriceToSymbolChartSearchMapper } from './mapper/current-price-to-symbol-search-chart.mapper';

@Injectable()
export class SymbolService {
  private readonly logger = new Logger(SymbolService.name);

  constructor(
    @InjectRepository(TokenSymbol)
    private serviceRepository: Repository<TokenSymbol>,
    @InjectRepository(CurrentPrice)
    private currentPriceRepository: Repository<CurrentPrice>,
    private mapper: CurrentPriceToSymbolChartSearchMapper,
  ) {}

  findOne(id: string): Promise<TokenSymbol> {
    return this.serviceRepository.findOneByOrFail({ id });
  }

  searchForChart(query: string): Promise<SymbolChartSearchDto[]> {
    const searchTerms = query.split(' ');

    const whereStatements = searchTerms.map(
      (term) =>
        ({
          fullName: Like('%' + term + '%'),
          deleted: false,
        } as FindOptionsWhere<CurrentPrice>),
    );

    const currentPrices = this.currentPriceRepository.find({
      where: whereStatements,
      order: { order: 'asc' },
    });

    return this.mapper.toDtosAsync(currentPrices);
  }
}
