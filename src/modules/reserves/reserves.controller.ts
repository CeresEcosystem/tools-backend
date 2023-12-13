import { Controller, Get, Param } from '@nestjs/common';
import { ReservesService } from './reserves.service';
import { ReservesDto } from './dto/reserves.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('/reserves')
@ApiTags('Reserves controller')
export class ReservesController {
  constructor(private readonly reservesService: ReservesService) {}

  @Get(':tokenSymbol')
  public getReserves(
    @Param('tokenSymbol') tokenSymbol: string,
  ): Promise<ReservesDto[]> {
    return this.reservesService.getTokensReserves(tokenSymbol);
  }
}
