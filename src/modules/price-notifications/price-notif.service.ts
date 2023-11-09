import { Injectable } from '@nestjs/common';
import { TokenPriceService } from '../token-price/token-price.service';
import { UserDevicesRepository } from './user-device.repository';
import { UserDevice } from './entity/user-device.entity';

@Injectable()
export class PriceNotifService {
  constructor(
    private tokenPriceService: TokenPriceService,
    private userDeviceRepo: UserDevicesRepository,
  ) {}

  async addInitFavorites(deviceId: string, tokens: string[]): Promise<void> {
    const user = await this.userDeviceRepo.findUser(deviceId);

    if (user) return;

    const newUser = new UserDevice();
    const allTokens = await this.tokenPriceService.findAll();
    const userTokens = allTokens.filter((relevantTokens) => {
      return tokens.includes(relevantTokens.assetId);
    });

    newUser.deviceId = deviceId;
    newUser.tokens = userTokens;
    await this.userDeviceRepo.saveUser(newUser);
  }

  async addNewFavoriteToken(deviceId: string, token: string): Promise<void> {
    const user = await this.userDeviceRepo.findUser(deviceId);
    const favToken = await this.tokenPriceService.findByAssetId(token);
    if (!user) {
      const newUser = new UserDevice();
      newUser.deviceId = deviceId;
      newUser.tokens = [favToken];
      await this.userDeviceRepo.saveUser(newUser);
    } else {
      user.tokens.push(favToken);
      await this.userDeviceRepo.saveUser(user);
    }
  }

  async deleteFavoriteToken(
    deviceId: string,
    tokenToDelete: string,
  ): Promise<void> {
    const user = await this.userDeviceRepo.findUser(deviceId);
    const favToken = await this.tokenPriceService.findByAssetId(tokenToDelete);

    const userTokens = user.tokens.filter((token) => {
      return token.assetId !== favToken.assetId;
    });
    user.tokens = userTokens;
    await this.userDeviceRepo.saveUser(user);
  }
}
