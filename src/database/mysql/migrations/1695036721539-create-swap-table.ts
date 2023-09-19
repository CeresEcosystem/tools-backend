import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSwapTable1695036721539 implements MigrationInterface {
  name = 'CreateSwapTable1695036721539';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`swap\` (
            \`id\` int NOT NULL AUTO_INCREMENT, 
            \`swapped_at\` timestamp NOT NULL, 
            \`account_id\` varchar(255) NOT NULL, 
            \`input_asset_id\` varchar(255) NOT NULL, 
            \`output_asset_id\` varchar(255) NOT NULL, 
            \`input_asset_amount\` float NOT NULL, 
            \`output_asset_amount\` float NOT NULL, 
            PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`swap\``);
  }
}
