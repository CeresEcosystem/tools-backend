export interface DateTokenSupplyTupleDto {
  token: string;
  date: string;
  supply: string;
}

export interface FormatedTokenSupplyDto {
  supplies: DateTokenSupplyTupleDto[];
}

export class FormatedTokenSupply implements FormatedTokenSupplyDto {
  supplies: DateTokenSupplyTupleDto[];

  constructor(data?: DateTokenSupplyTupleDto[]) {
    if (data) {
      this.supplies = data;
    } else {
      this.supplies = [];
    }
  }
}
