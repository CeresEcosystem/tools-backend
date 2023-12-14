import { MigrationInterface, QueryRunner } from 'typeorm';

export class createPairsPeriodicLiquidityChange1702477525960
  implements MigrationInterface
{
  name = 'createPairsPeriodicLiquidityChange1702477525960';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`pairs_periodic_liquidity_change\` (
            \`id\` int NOT NULL AUTO_INCREMENT, 
            \`base_asset_symbol\` varchar(255) NOT NULL, 
            \`base_asset_name\` varchar(255) NOT NULL, 
            \`base_asset_id\` varchar(255) NOT NULL, 
            \`token_asset_name\` varchar(255) NOT NULL, 
            \`token_asset_symbol\` varchar(255) NOT NULL, 
            \`token_asset_id\` varchar(255) NOT NULL, 
            \`liquidity\` int NOT NULL, 
            \`updated_at\` timestamp NOT NULL, 
            PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `pairs_periodic_liquidity_change`');
  }
}
