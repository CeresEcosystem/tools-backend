import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTransfersTable1700751135298 implements MigrationInterface {
  name = 'createTransfersTable1700751135298';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`transfer\` (
            \`id\` int NOT NULL AUTO_INCREMENT, 
            \`sender_account_id\` varchar(255) NOT NULL, 
            \`asset_id\` varchar(255) NOT NULL, 
            \`amount\` float NOT NULL, 
            \`receiver_account_id\` varchar(255) NOT NULL, 
            \`transferred_at\` timestamp NOT NULL, 
            \`block\` int NOT NULL, 
            PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `transfer`');
  }
}
