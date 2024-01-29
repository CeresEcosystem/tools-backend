import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 10;

export class PageOptionsDto {
  constructor(page?: number, size?: number) {
    this.page = page || DEFAULT_PAGE;
    this.size = size || DEFAULT_SIZE;
  }

  @ApiPropertyOptional({
    minimum: 1,
    default: DEFAULT_PAGE,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = DEFAULT_PAGE;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 50,
    default: DEFAULT_SIZE,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  size?: number = DEFAULT_SIZE;

  get skip(): number {
    return (this.page - 1) * this.size;
  }
}
