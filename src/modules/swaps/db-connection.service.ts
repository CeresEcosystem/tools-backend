import * as mysql from 'mysql2';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { SwapGateway } from './swaps.gateway';
config();
const configService = new ConfigService();

export class DbConnectionService {
  private connection: mysql.Connection;
  private lastCheckedId: number = 2205;
  private onBlockInit: number = 6000;

  // Create connection for the DB
  constructor(private swapGateway: SwapGateway) {
    this.connection = mysql.createConnection({
      host: configService.get('MYSQL_HOST'),
      user: configService.get('MYSQL_USER'),
      password: configService.get('MYSQL_PASSWORD'),
      database: configService.get('MYSQL_DB_NAME'),
    });
  }

  // Connect to the DB
  connect() {
    this.connection.connect();
  }

  // Watch DB changes (swap table only) on every block
  watchDatabaseChanges() {
    setInterval(() => {
      this.checkForNewRows();
    }, this.onBlockInit);
  }

  // If there are new rows in swap table, push it through the socket and update the id
  // Checking if there is a new row is based on unique id
  private checkForNewRows() {
    const query = `SELECT * FROM swap WHERE id > ${this.lastCheckedId}`;
    this.connection.query(query, [this.lastCheckedId], (error, results) => {
      if (error) {
        console.error('Error checking for new rows:', error);
        return;
      }
      const result = JSON.parse(JSON.stringify(results));
      const [swap] = result;
      this.swapGateway.onNewMessage(swap);
      console.log(swap);
      this.lastCheckedId = swap.id || this.lastCheckedId;
    });
  }
}
