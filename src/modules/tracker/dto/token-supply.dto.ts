interface TimestampSupplyTupleDto {
  timestamp: string;
  supply: string;
}

export interface TokenSupplyDto {
  supplies: TimestampSupplyTupleDto[];
}

export class TokenSupply implements TokenSupplyDto {
  supplies: TimestampSupplyTupleDto[];

  constructor(data?: any) {
    if (data) {
      let extractedData: TimestampSupplyTupleDto[] = [];
      for (const row of data) {
        const [timestamp, supply] = row;
        extractedData.push({
          timestamp: String(timestamp),
          supply: String(supply),
        });
      }
      this.supplies = extractedData;
    } else {
      this.supplies = [];
    }
  }
}
