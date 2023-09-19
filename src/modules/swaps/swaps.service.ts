import { Injectable } from '@nestjs/common';
import { SwapListener } from './swap.listener';

@Injectable()
export class SwapsService {
  constructor(private swapRepository: SwapListener) {}

  async getInputTokens(assetIdInputToken: string) {
    return this.swapRepository.findSwapsByInputAssetId(assetIdInputToken);
  }
}
