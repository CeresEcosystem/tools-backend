import { PageDto } from 'src/utils/pagination/page.dto';
import { SwapsStatsDto } from './swaps-stats.dto';
import { PageMetaDto } from 'src/utils/pagination/page-meta.dto';

export class SwapsPageDto<T> extends PageDto<T> {
  readonly stats: SwapsStatsDto;

  constructor(data: T[], meta: PageMetaDto, stats: SwapsStatsDto) {
    super(data, meta);
    this.stats = stats;
  }
}
