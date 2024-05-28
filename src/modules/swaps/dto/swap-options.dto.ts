import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class SwapOptionsDto {
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  dateFrom?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  dateTo?: Date;

  @ApiPropertyOptional({
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  minAmount?: number;

  @ApiPropertyOptional({
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxAmount?: number;

  @IsOptional()
  @IsIn(['ASC', 'DESC'], {
    message: 'Invalid orderBy value. Must be "ASC" or "DESC".',
  })
  orderBy?: 'ASC' | 'DESC' = 'DESC';

  @IsString()
  @IsOptional()
  assetId?: string;

  @IsOptional()
  excludedAccIds?: string[];
}
