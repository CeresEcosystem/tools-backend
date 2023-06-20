interface TimestampleSupplyTupleDto {
  timestamp: string;
  supply: string;
}

export interface TokenSupplyDto {
  supplies: TimestampleSupplyTupleDto[];
}

export class TokenSupply implements TokenSupplyDto {
  supplies: TimestampleSupplyTupleDto[];

  constructor(data?: any) {
    if (data) {
      let extractedData: TimestampleSupplyTupleDto[] = [];
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
