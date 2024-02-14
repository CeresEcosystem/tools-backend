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

const DEFAULT_MIN_AMOUNT = 0;
const DEFAULT_MAX_AMOUNT = Number.MAX_SAFE_INTEGER;

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
  minAmount?: number = DEFAULT_MIN_AMOUNT;

  @ApiPropertyOptional({
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxAmount?: number = DEFAULT_MAX_AMOUNT;

  @IsOptional()
  @IsIn(['ASC', 'DESC'], {
    message: 'Invalid orderBy value. Must be "ASC" or "DESC".',
  })
  orderBy?: 'ASC' | 'DESC' = 'DESC';

  @IsString()
  @IsOptional()
  assetId?: string;

  @IsOptional()
  accountIds?: string[];
}
