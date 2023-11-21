import { MigrationInterface, QueryRunner } from 'typeorm';

export class createRelevantPricesTable1700064309286
  implements MigrationInterface
{
  name = 'createRelevantPricesTable1700064309286';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`relevant_prices\` (
            \`id\` int NOT NULL AUTO_INCREMENT, 
            \`token\` varchar(255) NOT NULL, 
            \`asset_id\` varchar(255) NOT NULL, 
            \`token_price\` float NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `relevant_prices`');
  }
}
