import { ApiProperty } from '@nestjs/swagger';
import { PageMetaDto } from './page-meta.dto';
import { PageDto } from './page.dto';

export class PageWithSummaryDto<T, S> extends PageDto<T> {
  @ApiProperty()
  readonly summary: S;

  constructor(data: T[], meta: PageMetaDto, summary?: S) {
    super(data, meta);
    this.summary = summary;
  }
}
