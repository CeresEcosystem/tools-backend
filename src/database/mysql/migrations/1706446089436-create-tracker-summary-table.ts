import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTrackerSummaryTable1706446089436
  implements MigrationInterface
{
  name = 'createTrackerSummaryTable1706446089436';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`tracker_summary\` (
        \`id\` int NOT NULL AUTO_INCREMENT, 
        \`token\` varchar(10) NOT NULL, 
        \`period\` enum ('DAY', 'WEEK', 'MONTH', 'ALL') NOT NULL, 
        \`gross_burn\` float NOT NULL, 
        \`net_burn\` float NOT NULL, 
        UNIQUE INDEX \`IDX_token_period\` (\`token\`, \`period\`), 
        PRIMARY KEY (\`id\`)
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `IDX_token_period` ON `tracker_summary`',
    );
    await queryRunner.query('DROP TABLE `tracker_summary`');
  }
}
