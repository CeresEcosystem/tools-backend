import { Injectable, OnModuleInit } from '@nestjs/common';
import { TokenPriceService } from '../token-price/token-price.service';
import { RelevantPrices } from './entity/relevant-prices.entity';
import { RelevantPricesRepository } from './relevant-prices.repository';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class RelevantPricesInit implements OnModuleInit {
  constructor(
    private tokenPriceService: TokenPriceService,
    private relevantPricesRepo: RelevantPricesRepository,
  ) {}

  async onModuleInit() {
    const relevantTokens = await this.relevantPricesRepo.findAll();
    if (relevantTokens.length > 0) return;
    this.setRelevantPrices();
  }

  async setRelevantPrices() {
    const allTokens = await this.tokenPriceService.findAll();
    allTokens.forEach((token) => {
      const relevantPrices = new RelevantPrices();
      relevantPrices.token = token.fullName;
      relevantPrices.assetId = token.assetId;
      relevantPrices.tokenPrice = Number(token.price);
      this.relevantPricesRepo.saveToken(relevantPrices);
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async addNewTokenIfExists() {
    const allTokens = await this.tokenPriceService.findAll();
    const allRelevantTokens = await this.relevantPricesRepo.findAll();

    const newTokens = allTokens.filter((token) => {
      return !allRelevantTokens.some(
        (relevantToken) => relevantToken.assetId === token.assetId,
      );
    });

    newTokens.forEach((token) => {
      const newRelevantToken = new RelevantPrices();
      newRelevantToken.assetId = token.assetId;
      newRelevantToken.token = token.fullName;
      newRelevantToken.tokenPrice = Number(token.price);
      this.relevantPricesRepo.saveToken(newRelevantToken);
    });
  }
}
