import * as mysql from 'mysql2';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { SwapGateway } from './swaps.gateway';
import { Injectable } from '@nestjs/common/decorators';

config();
const configService = new ConfigService();

@Injectable()
export class DbConnectionService {
  private connection: mysql.Connection;
  private onBlockInit: number = 6000;
  private lastCheckedId: number = 0;

  constructor(private swapGateway: SwapGateway) {
    this.connection = mysql.createConnection({
      host: configService.get('MYSQL_HOST'),
      user: configService.get('MYSQL_USER'),
      password: configService.get('MYSQL_PASSWORD'),
      database: configService.get('MYSQL_DB_NAME'),
    });
  }

  connect() {
    this.connection.connect();
  }

  watchDatabaseChanges(assetId: string) {
    setInterval(() => {
      this.checkForNewRows(assetId);
    }, this.onBlockInit);
  }

  private checkForNewRows(assetId: string) {
    const query = `SELECT * FROM swap WHERE id > ${this.lastCheckedId}`;
    this.connection.query(query, [this.lastCheckedId], (error, results) => {
      if (error) {
        console.error('Error checking for new rows: ', error);
        return;
      }
      const result = JSON.parse(JSON.stringify(results));
      const swaps = result;
      swaps.forEach((swap) => {
        if (
          swap.input_asset_id === assetId ||
          swap.output_asset_id === assetId
        ) {
          const swapType = swap.input_asset_id === assetId ? 'sell' : 'buy';
          this.swapGateway.onSwap({ ...swap, swapType });
        }
        this.lastCheckedId = swap.id || this.lastCheckedId;
      });
    });
  }
}
