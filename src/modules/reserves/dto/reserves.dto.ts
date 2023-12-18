import { ReservesHistoryDto } from './reserves-history.dto';

export interface ReservesDto {
  currentBalace: number;
  currentValue: number;
  data: ReservesHistoryDto[];
}
