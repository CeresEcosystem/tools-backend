import { Injectable } from '@nestjs/common';
import { SwapService } from '../swaps/swaps.service';
import { ChronoPriceService } from '../chrono-price/chrono-price.service';
import { TokenPriceService } from '../token-price/token-price.service';
import { TokenVolumeDto } from './dto/token-volume.dto';

@Injectable()
export class VolumesService {
  constructor(
    private readonly swapService: SwapService,
    private readonly chronoPriceService: ChronoPriceService,
    private readonly tokenPriceService: TokenPriceService,
  ) {}

  public async getVolumes(): Promise<TokenVolumeDto[]> {
    const tokens = await this.tokenPriceService.findAll();
    const swaps = await this.swapService.findSwapsForVolumes();

    const tokenAndVolume = await Promise.all(
      tokens.map(async (token) => {
        const tokenSwaps = swaps.filter(
          (swap) =>
            swap.inputAssetId === token.assetId ||
            swap.outputAssetId === token.assetId,
        );

        const totalAmountSwapped = tokenSwaps.reduce((acc, swap) => {
          if (swap.inputAssetId === token.assetId) {
            return acc + swap.assetInputAmount;
          }

          return acc + swap.assetOutputAmount;
        }, 0);

        if (totalAmountSwapped === 0) {
          return {
            token: token.token,
            volume: 0,
            timestamp: Date.now(),
          };
        }
        const tokenPrice = await this.chronoPriceService.getPriceForVolume(
          token.token,
        );

        return {
          token: token.token,
          volume: totalAmountSwapped * tokenPrice.price,
          timestamp: Date.now(),
        };
      }),
    );

    return tokenAndVolume;
  }
}
