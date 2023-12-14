import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxDate,
  Min,
  MinDate,
} from 'class-validator';
import { getDateOneMonthBefore } from 'src/utils/date-utils';

const DEFAULT_DATE_FROM = getDateOneMonthBefore();
const DEFAULT_DATE_TO = new Date();
const DEFAULT_MIN_AMOUNT = 0;
const DEFAULT_MAX_AMOUNT = 1000000000;

export class SwapOptionsDto {
  @Type(() => Date)
  @IsDate()
  @MinDate(getDateOneMonthBefore())
  @MaxDate(new Date())
  @IsOptional()
  dateFrom?: Date = DEFAULT_DATE_FROM;

  @Type(() => Date)
  @IsDate()
  @MinDate(getDateOneMonthBefore())
  @MaxDate(new Date())
  @IsOptional()
  dateTo?: Date = DEFAULT_DATE_TO;

  @ApiPropertyOptional({
    minimum: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  minAmount?: number = DEFAULT_MIN_AMOUNT;

  @ApiPropertyOptional({
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
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
}
