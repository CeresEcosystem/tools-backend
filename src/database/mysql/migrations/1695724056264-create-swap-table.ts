import { MigrationInterface, QueryRunner } from 'typeorm';

export class createSwapTable1695724056264 implements MigrationInterface {
  name = 'createSwapTable1695724056264';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`swap\` (
            \`id\` int NOT NULL AUTO_INCREMENT, 
            \`swapped_at\` timestamp NOT NULL, 
            \`account_id\` varchar(255) NOT NULL, 
            \`input_asset_id\` varchar(255) NOT NULL, 
            \`output_asset_id\` varchar(255) NOT NULL, 
            \`input_asset_amount\` float NOT NULL, 
            \`output_asset_amount\` float NOT NULL, 
            UNIQUE INDEX \`IDX_e204f9f0d3b45d4259287d378e\` 
            (\`swapped_at\`, \`account_id\`, \`input_asset_id\`, \`output_asset_id\`,
             \`input_asset_amount\`, \`output_asset_amount\`), 
            PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `IDX_e204f9f0d3b45d4259287d378e` ON `swap`',
    );
    await queryRunner.query('DROP TABLE `swap`');
  }
}
