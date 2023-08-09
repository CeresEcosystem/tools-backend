import { ApiProperty } from '@nestjs/swagger';

export class PageMetaDto {
  @ApiProperty()
  readonly pageNumber: number;

  @ApiProperty()
  readonly pageSize: number;

  @ApiProperty()
  readonly totalCount: number;

  @ApiProperty()
  readonly pageCount: number;

  @ApiProperty()
  readonly hasPreviousPage: boolean;

  @ApiProperty()
  readonly hasNextPage: boolean;

  constructor(pageNumber: number, pageSize: number, totalCount: number) {
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    this.totalCount = totalCount;
    this.pageCount = Math.ceil(this.totalCount / this.pageSize);
    this.hasPreviousPage = this.pageNumber > 1;
    this.hasNextPage = this.pageNumber < this.pageCount;
  }
}
