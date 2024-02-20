import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class SearchOptionsDto {
  @IsString()
  @IsOptional()
  accountId?: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  dateFrom?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  dateTo?: Date;
}
