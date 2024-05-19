/* eslint-disable no-console */
import { BootstrapConsole, ConsoleModule } from 'nestjs-console';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackerModule } from './modules/tracker/tracker.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ReservesModule } from './modules/reserves/reserves.module';
import { ReserveSeeder } from './modules/reserves/reserves.seeder';
import { ChronoPriceModule } from './modules/chrono-price/chrono-price.module';
import { ReservesService } from './modules/reserves/reserves.service';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { ReserveEntityToDtoMapper } from './modules/reserves/mapper/reserves-entity-to-dto.mapper';
import { ThrottlerModule } from '@nestjs/throttler';
import { TelegramLoggerModule } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 10,
      },
    ]),
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
      autoLoadEntities: true,
    }),
    TelegramLoggerModule,
    TrackerModule,
    ReservesModule,
    ChronoPriceModule,
    PortfolioModule,
    ThrottlerModule,
    ConsoleModule,
  ],
  controllers: [],
  providers: [ReserveSeeder, ReservesService, ReserveEntityToDtoMapper],
})
class AppConsoleModule {}

const nestConsole = new BootstrapConsole({
  module: AppConsoleModule,
  useDecorators: true,
});

nestConsole.init().then(async (app) => {
  try {
    await app.init();
    await nestConsole.boot();
    await app.close();

    process.exit(0);
  } catch (e) {
    console.log(e);
    await app.close();

    process.exit(1);
  }
});
