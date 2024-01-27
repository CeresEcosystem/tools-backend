import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTrackerBurnTable1706312269483 implements MigrationInterface {
  name = 'createTrackerBurnTable1706312269483';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`tracker_burn\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`token\` varchar(10) NOT NULL,
        \`date_raw\` date NOT NULL,
        \`xor_spent\` float NOT NULL, 
        \`gross_burn\` float NOT NULL,
        \`net_burn\` float NOT NULL, 
        \`reminted_lp\` float NOT NULL, 
        \`reminted_parliament\` float NOT NULL, 
        \`xor_dedicated_for_buy_back\` float NOT NULL, 
        UNIQUE INDEX \`IDX_token_date\` (\`token\`, \`date_raw\`), 
        PRIMARY KEY (\`id\`)
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `IDX_token_date` ON `tracker_burn`');
    await queryRunner.query('DROP TABLE `tracker_burn`');
  }
}
