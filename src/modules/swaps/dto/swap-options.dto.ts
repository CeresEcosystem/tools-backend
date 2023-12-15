import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxDate,
  Min,
  MinDate,
} from 'class-validator';
import { addSeconds, getDateOneMonthBefore } from 'src/utils/date-utils';

const DEFAULT_MIN_AMOUNT = 0;
const DEFAULT_MAX_AMOUNT = Number.MAX_SAFE_INTEGER;

export class SwapOptionsDto {
  @Type(() => Date)
  @IsDate()
  @MinDate(getDateOneMonthBefore())
  @MaxDate(addSeconds(new Date(), 30))
  @IsOptional()
  dateFrom?: Date = getDateOneMonthBefore();

  @Type(() => Date)
  @IsDate()
  @MinDate(getDateOneMonthBefore())
  @MaxDate(addSeconds(new Date(), 30))
  @IsOptional()
  dateTo?: Date = new Date();

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
}
