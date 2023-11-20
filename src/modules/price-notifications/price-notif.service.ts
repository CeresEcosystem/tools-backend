import { Injectable, Logger } from '@nestjs/common';
import { TokenPriceService } from '../token-price/token-price.service';
import { UserDevicesRepository } from './user-device.repository';
import { UserDevice } from './entity/user-device.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RelevantPricesRepository } from '../notification-relevant-prices/relevant-prices.repository';
import { OneSignalClient } from '../one-signal-client/one-signal-client';

@Injectable()
export class PriceNotifService {
  private readonly logger = new Logger(PriceNotifService.name);

  constructor(
    private tokenPriceService: TokenPriceService,
    private userDeviceRepo: UserDevicesRepository,
    private relevantPricesRepo: RelevantPricesRepository,
    private oneSignalClient: OneSignalClient,
  ) {}

  async addInitFavorites(deviceId: string, tokens: string[]): Promise<void> {
    const user = await this.userDeviceRepo.findUserByDevice(deviceId);

    if (user) return;

    const newUser = new UserDevice();
    const allTokens = await this.tokenPriceService.findAll();
    const userTokens = allTokens.filter((relevantTokens) => {
      return tokens.includes(relevantTokens.assetId);
    });

    newUser.deviceId = deviceId;
    newUser.tokens = userTokens;
    this.userDeviceRepo.saveUser(newUser);
  }

  async addNewFavoriteToken(deviceId: string, token: string): Promise<void> {
    const user = await this.userDeviceRepo.findUserByDevice(deviceId);
    const favToken = await this.tokenPriceService.findByAssetId(token);
    if (!user) {
      const newUser = new UserDevice();
      newUser.deviceId = deviceId;
      newUser.tokens = [favToken];
      this.userDeviceRepo.saveUser(newUser);
    } else {
      user.tokens.push(favToken);
      this.userDeviceRepo.saveUser(user);
    }
  }

  async deleteFavoriteToken(
    deviceId: string,
    tokenToDelete: string,
  ): Promise<void> {
    const user = await this.userDeviceRepo.findUserByDevice(deviceId);
    const favToken = await this.tokenPriceService.findByAssetId(tokenToDelete);

    if (!user || !user.tokens) return;

    const userTokens = user.tokens.filter((token) => {
      return token.assetId !== favToken.assetId;
    });

    user.tokens = userTokens;

    if (user.tokens.length > 0) this.userDeviceRepo.saveUser(user);

    this.userDeviceRepo.deleteUser(user);
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkPriceDifferences() {
    this.logger.log('Start prices comparison');
    const allRelevantPrices = await this.relevantPricesRepo.findAll();
    const allCurrentPrices = await this.tokenPriceService.findAll();
    const allUsers = await this.userDeviceRepo.findAll();

    for (const relevantPrice of allRelevantPrices) {
      const [currentPrice] = allCurrentPrices.filter((currentPrice) => {
        return currentPrice.assetId === relevantPrice.assetId;
      });

      const significantChange = this.calculate_change(
        relevantPrice.tokenPrice,
        Number(currentPrice.price),
        5,
      );

      if (significantChange) {
        const usersWithToken = allUsers.filter((user) => {
          const hasToken = user.tokens.some(
            (token) => token.assetId === relevantPrice.assetId,
          );
          return hasToken;
        });

        await this.oneSignalClient.sendPriceChangeNotification(
          usersWithToken,
          currentPrice,
        );
        relevantPrice.tokenPrice = Number(currentPrice.price);
        await this.relevantPricesRepo.saveToken(relevantPrice);
      }
    }
    this.logger.log('Prices comparison successfull');
  }

  calculate_change(
    relevantPrice: number,
    currentPrice: number,
    percentegeThreshold: number,
  ): Boolean {
    const percentageChange =
      ((currentPrice - relevantPrice) / relevantPrice) * 100;
    return Math.abs(percentageChange) >= percentegeThreshold;
  }
}
