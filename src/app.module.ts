import { MiddlewareConsumer, Module } from '@nestjs/common';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TradingModule } from './modules/trading/trading.module';
import { TelegramLoggerModule } from './modules/logger/telegram-logger.module';
import { ScheduleModule } from '@nestjs/schedule';
import { IconsModule } from './modules/icons/icons.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { LiquidityPairsModule } from './modules/liquidity-pairs/liquidity-pairs.module';
import { TrackerSupplyModule } from './modules/tracker-supply/tracker-supply.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'storage'),
      serveRoot: '/storage',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DB_NAME,
      autoLoadEntities: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      name: 'pg',
      host: process.env.PG_HOST,
      port: Number(process.env.PG_PORT),
      username: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DB_NAME,
      autoLoadEntities: false,
    }),
    TradingModule,
    TelegramLoggerModule,
    IconsModule,
    LiquidityPairsModule,
    TrackerSupplyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
