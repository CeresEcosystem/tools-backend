import { ReservesHistoryDto } from './reserves-history.dto';

export interface ReservesDto {
  currentBalance: number;
  currentValue: number;
  data: ReservesHistoryDto[];
}
