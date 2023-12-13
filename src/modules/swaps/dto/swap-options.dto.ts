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
import { ObjectLiteral } from 'typeorm';
import { getDateOneMonthBefore } from 'src/utils/date-utils';

type WhereClause = {
  where: string;
  parameters: ObjectLiteral;
};

export class SwapOptionsDto {
  @Type(() => Date)
  @IsDate()
  @MinDate(getDateOneMonthBefore())
  @MaxDate(new Date())
  @IsOptional()
  dateFrom?: Date;

  @Type(() => Date)
  @IsDate()
  @MinDate(getDateOneMonthBefore())
  @MaxDate(new Date())
  @IsOptional()
  dateTo?: Date;

  @ApiPropertyOptional({
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  minAmount?: number;

  @ApiPropertyOptional({
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  maxAmount?: number;

  @IsOptional()
  @IsIn(['ASC', 'DESC'], {
    message: 'Invalid orderBy value. Must be "ASC" or "DESC".',
  })
  orderBy?: 'ASC' | 'DESC' = 'DESC';

  @Type(() => String)
  @IsString()
  @IsOptional()
  assetId?: string;

  get whereClauses(): WhereClause[] {
    const whereClause: WhereClause[] = [];

    if (this.dateFrom || this.dateTo) {
      const dateFromCondition = this.dateFrom
        ? 'swap.swappedAt >= :dateFrom'
        : '';
      const dateToCondition = this.dateTo ? 'swap.swappedAt <= :dateTo' : '';

      whereClause.push({
        where: [dateFromCondition, dateToCondition]
          .filter(Boolean)
          .join(' AND '),
        parameters: { dateFrom: this.dateFrom, dateTo: this.dateTo },
      });
    }

    if (this.minAmount && this.maxAmount) {
      whereClause.push({
        where: `((swap.assetInputAmount >= :minAmount AND swap.assetInputAmount <= :maxAmount) 
          OR (swap.assetOutputAmount >= :minAmount AND swap.assetOutputAmount <= :maxAmount))`,
        parameters: { minAmount: this.minAmount, maxAmount: this.maxAmount },
      });
    } else if (this.minAmount || this.maxAmount) {
      const minAmountCondition = this.minAmount
        ? '(swap.assetInputAmount >= :minAmount OR swap.assetOutputAmount >= :minAmount)'
        : '';
      const maxAmountCondition = this.maxAmount
        ? '(swap.assetInputAmount <= :maxAmount OR swap.assetOutputAmount <= :maxAmount)'
        : '';

      whereClause.push({
        where: [minAmountCondition, maxAmountCondition]
          .filter(Boolean)
          .join(' AND '),
        parameters: { minAmount: this.minAmount, maxAmount: this.maxAmount },
      });
    }

    if (this.assetId) {
      whereClause.push({
        where:
          '(swap.inputAssetId = :assetId OR swap.outputAssetId = :assetId)',
        parameters: { assetId: this.assetId },
      });
    }

    return whereClause;
  }
}
