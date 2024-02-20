import { MigrationInterface, QueryRunner } from 'typeorm';

export class createKensetsuBurn1708424860171 implements MigrationInterface {
  name = 'createKensetsuBurn1708424860171';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`kensetsu-burn\` (
        \`id\` int NOT NULL AUTO_INCREMENT, 
        \`account_id\` varchar(255) NOT NULL, 
        \`asset_id\` varchar(255) NOT NULL, 
        \`block_num\` varchar(255) NOT NULL, 
        \`amount_burned\` decimal(16,2) NOT NULL, 
        \`created_at\` timestamp NOT NULL, 
        PRIMARY KEY (\`id\`)
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `kensetsu-burn`');
  }
}
