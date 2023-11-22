import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTransactionsTable1700669840501
  implements MigrationInterface
{
  name = 'createTransactionsTable1700669840501';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`Transactions\` (
            \`id\` int NOT NULL AUTO_INCREMENT, 
            \`sender_account_id\` varchar(255) NOT NULL, 
            \`asset_id\` varchar(255) NOT NULL, 
            \`amount\` float NOT NULL, 
            \`receiver_acc_id\` varchar(255) NOT NULL, 
            PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`Transactions\``);
  }
}
