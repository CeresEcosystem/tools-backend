import { Controller, Get, Param } from '@nestjs/common';
import { SwapListener } from './swap.listener';
import { SwapsService } from './swaps.service';

@Controller('swaps')
export class SwapsController {
  constructor(
    private swapListener: SwapListener,
    private swapService: SwapsService,
  ) {}

  @Get()
  getEventObject() {
    return this.swapListener.startListener();
  }

  @Get('/:inputToken')
  getSwapsForInputToken(@Param('inputToken') inputToken: string) {
    return this.swapListener.findSwapsByInputAssetId(inputToken);
  }
}
