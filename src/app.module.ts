import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TradingModule } from './modules/trading/trading.module';
import { TelegramLoggerModule } from './modules/logger/telegram-logger.module';
import { ScheduleModule } from '@nestjs/schedule';
import { IconsModule } from './modules/icons/icons.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PairsModule } from './modules/pairs/pairs.module';
import { TrackerModule } from './modules/tracker/tracker.module';
import { TokenPriceModule } from './modules/token-price/token-price.module';
import { RewardsModule } from './modules/rewards/rewards.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { BannerModule } from './modules/banner/banner.module';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { TokenOrderModule } from './modules/token-order/token-order.module';
import { SwapsModule } from './modules/swaps/swaps.module';
import { PairsLiquidityModule } from './modules/pairs-liquidity/pairs-liquidity.module';
import { PriceNotifModule } from './modules/price-notifications/price-notif.module';
import { TransfersModule } from './modules/transfers/transfers.module';
import { ReservesModule } from './modules/reserves/reserves.module';
import { TokenHoldersModule } from './modules/token-holders/token-holders.module';
import { CurrencyRateModule } from './modules/currency-rate/currency-rate.module';
import { MarketCapModule } from './modules/market-cap/market-cap.module';
import { VolumesModule } from './modules/volumes/volumes.module';
import { KensetsuModule } from './modules/kensetsu/kensetsu.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    NestjsFormDataModule.config({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'storage'),
      serveRoot: '/storage',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      autoLoadEntities: true,
      logging: Boolean(process.env.LOG_MYSQL_QUERIES),
      replication: {
        master: {
          host: process.env.MYSQL_HOST,
          port: Number(process.env.MYSQL_PORT),
          username: process.env.MYSQL_USER,
          password: process.env.MYSQL_PASSWORD,
          database: process.env.MYSQL_DB_NAME,
        },
        slaves: [
          {
            host: process.env.MYSQL_HOST,
            port: Number(process.env.MYSQL_PORT),
            username: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DB_NAME,
          },
        ],
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      name: 'pg',
      host: process.env.PG_HOST,
      port: Number(process.env.PG_PORT),
      username: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DB_NAME,
      autoLoadEntities: true,
      logging: Boolean(process.env.LOG_PSQL_QUERIES),
      extra: {
        max: 100,
      },
    }),
    TradingModule,
    TelegramLoggerModule,
    IconsModule,
    PairsModule,
    TrackerModule,
    TokenPriceModule,
    RewardsModule,
    MailerModule,
    PortfolioModule,
    BannerModule,
    TokenOrderModule,
    SwapsModule,
    PairsLiquidityModule,
    PriceNotifModule,
    TransfersModule,
    ReservesModule,
    TokenHoldersModule,
    CurrencyRateModule,
    MarketCapModule,
    VolumesModule,
    KensetsuModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
