import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'mysql',
  host: configService.get('MYSQL_HOST'),
  port: configService.get('MYSQL_PORT'),
  username: configService.get('MYSQL_USER'),
  password: configService.get('MYSQL_PASSWORD'),
  database: configService.get('MYSQL_DB_NAME'),
  entities: [
    'src/modules/swaps/entity/swaps.entity.ts',
    'src/modules/price-notifications/entity/user-device.entity.ts',
    'src/modules/notification-relevant-prices/entity/relevant-prices.entity.ts',
    'src/modules/token-price/entity/token-price.entity.ts',
    'src/modules/transfers/entity/transfer.entity.ts',
  ],
  migrations: ['src/database/mysql/migrations/*'],
  migrationsTableName: 'migrations_tools',
});
