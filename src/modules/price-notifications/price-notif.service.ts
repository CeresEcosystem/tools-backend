import { Injectable, Logger } from '@nestjs/common';
import { TokenPriceService } from '../token-price/token-price.service';
import { RelevantPricesService } from '../notification-relevant-prices/relevant-prices.service';
import { UserDevicesRepository } from './user-device.repository';
import { UserDevice } from './entity/user-device.entity';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from 'src/utils/cron-expression.enum';
import { OneSignalClient } from '../one-signal-client/one-signal-client';

const DEVIATION_THRESHOLD = 4.5;

@Injectable()
export class PriceNotifService {
  private readonly logger = new Logger(PriceNotifService.name);

  constructor(
    private tokenPriceService: TokenPriceService,
    private userDeviceRepo: UserDevicesRepository,
    private relevantPricesService: RelevantPricesService,
    private oneSignalClient: OneSignalClient,
  ) {}

  public async addInitFavorites(
    deviceId: string,
    tokens: string[],
  ): Promise<void> {
    const user = await this.userDeviceRepo.findUserByDevice(deviceId);

    if (user) {
      return;
    }

    const newUser = new UserDevice();
    const allTokens = await this.tokenPriceService.findAll();
    const userTokens = allTokens.filter((relevantTokens) =>
      tokens.includes(relevantTokens.assetId),
    );

    newUser.deviceId = deviceId;
    newUser.tokens = userTokens;

    await this.userDeviceRepo.saveUser(newUser);
  }

  public async addNewFavoriteToken(
    deviceId: string,
    token: string,
  ): Promise<void> {
    const user = await this.userDeviceRepo.findUserByDevice(deviceId);
    const favToken = await this.tokenPriceService.findByAssetId(token);

    if (user) {
      user.tokens.push(favToken);
      this.userDeviceRepo.saveUser(user);
    } else {
      const newUser = new UserDevice();
      newUser.deviceId = deviceId;
      newUser.tokens = [favToken];
      this.userDeviceRepo.saveUser(newUser);
    }
  }

  public async deleteFavoriteToken(
    deviceId: string,
    tokenToDelete: string,
  ): Promise<void> {
    const user = await this.userDeviceRepo.findUserByDevice(deviceId);
    const favToken = await this.tokenPriceService.findByAssetId(tokenToDelete);

    if (!user || !user.tokens) {
      return;
    }

    const userTokens = user.tokens.filter(
      (token) => token.assetId !== favToken.assetId,
    );

    user.tokens = userTokens;

    if (user.tokens.length > 0) {
      this.userDeviceRepo.saveUser(user);
    } else {
      this.userDeviceRepo.deleteUser(user);
    }
  }

  @Cron(CronExpression.EVERY_2_MINUTES)
  public async checkPriceDifferences(): Promise<void> {
    this.logger.log('Start prices comparison');
    const allRelevantPrices =
      await this.relevantPricesService.findAllRelevantTokens();
    const allCurrentPrices = await this.tokenPriceService.findAll();
    const allUsers = await this.userDeviceRepo.findAll();

    for (const relevantPrice of allRelevantPrices) {
      const [currentPrice] = allCurrentPrices.filter(
        (currentPrice) => currentPrice.assetId === relevantPrice.assetId,
      );

      const priceDeviation = this.calculatePriceDeviation(
        relevantPrice.tokenPrice,
        currentPrice.price,
      );

      if (Math.abs(priceDeviation) > DEVIATION_THRESHOLD) {
        const usersWithToken = allUsers.filter((user) => {
          const hasToken = user.tokens.some(
            (token) => token.assetId === relevantPrice.assetId,
          );

          return hasToken;
        });

        relevantPrice.tokenPrice = currentPrice.price;

        await this.oneSignalClient.sendPriceChangeNotification(
          usersWithToken,
          currentPrice,
          priceDeviation,
        );
        await this.relevantPricesService.saveRelevantToken(relevantPrice);
      }
    }
    this.logger.log('Prices comparison successful');
  }

  private calculatePriceDeviation(
    relevantPrice: number,
    currentPrice: number,
  ): number {
    const priceDeviation =
      ((currentPrice - relevantPrice) / relevantPrice) * 100;

    return priceDeviation;
  }
}
