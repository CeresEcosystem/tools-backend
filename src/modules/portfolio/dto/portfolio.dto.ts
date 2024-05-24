export class PortfolioDto {
  fullName: string;
  token: string;
  price: number;
  balance: number;
  value: number;
}

export class PortfolioExtendedDto extends PortfolioDto {
  oneHour: number;
  oneHourValueDifference: number;
  oneDay: number;
  oneDayValueDifference: number;
  oneWeek: number;
  oneWeekValueDifference: number;
  oneMonth: number;
  oneMonthValueDifference: number;
}
