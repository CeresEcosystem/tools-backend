import { Injectable } from '@nestjs/common';
import { WsProvider, ApiPromise } from '@polkadot/api';
import { FPNumber } from '@sora-substrate/math';
import { XOR_ADDRESS, PROVIDER } from 'src/constants/constants';
import { options } from '@sora-substrate/api';
import { PortfolioDto } from './dto/portfolio.dto';
import { TokenPriceService } from '../token-price/token-price.service';

const DENOMINATOR = FPNumber.fromNatural(Math.pow(10, 18));

@Injectable()
export class PortfolioService {
  private api;

  constructor(private tokenPriceService: TokenPriceService) {
    const provider = new WsProvider(PROVIDER);
    new ApiPromise(options({ provider, noInitWarn: true })).isReady.then(
      (api) => (this.api = api),
    );
  }

  async getQuantity(accountId: string): Promise<PortfolioDto[]> {
    let assetIdsAndAssetBalances: PortfolioDto[] = [];

    const xor = await this.api.rpc.assets.freeBalance(accountId, XOR_ADDRESS);
    const value = !xor.isNone ? xor.unwrap() : { balance: 0 };
    const balance = new FPNumber(value.balance).toNumber();
    const tokenEntity = await this.tokenPriceService.findByAssetId(XOR_ADDRESS);
    assetIdsAndAssetBalances.push({
      assetId: XOR_ADDRESS,
      fullName: tokenEntity.fullName,
      token: tokenEntity.token,
      price: Number(tokenEntity.price),
      balance,
      value: Number(tokenEntity.price) * balance,
    });

    const portfolio = await this.api.query.tokens.accounts.entries(accountId);
    for (const [assetsId, assetAmount] of portfolio) {
      let { free: assetBalance } = assetAmount.toHuman();
      let balance = new FPNumber(assetBalance).div(DENOMINATOR).toNumber();
      if (balance === 0) continue;

      let [, { code: assetId }] = assetsId.toHuman();
      let tokenEntity = await this.tokenPriceService.findByAssetId(assetId);

      assetIdsAndAssetBalances.push({
        assetId,
        fullName: tokenEntity.fullName,
        token: tokenEntity.token,
        price: Number(tokenEntity.price),
        balance,
        value: Number(tokenEntity.price) * balance,
      });
    }
    return assetIdsAndAssetBalances;
  }
}
