import { Controller, Get, Logger, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentPriceService } from './current-price.service';

@Controller('prices')
@ApiTags('Prices Controller')
export class CurrentPriceController {
  private readonly logger = new Logger(CurrentPriceController.name);

  constructor(private readonly currentPriceService: CurrentPriceService) {}

  @Get('/:token')
  public async getPrice(@Param('token') token: string): Promise<string> {
    const { price } = await this.currentPriceService.findByToken(token);

    return price;
  }
}
