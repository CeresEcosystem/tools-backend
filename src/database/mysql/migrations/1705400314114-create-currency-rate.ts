import { MigrationInterface, QueryRunner } from 'typeorm';

export class createCurrencyRate1705400314114 implements MigrationInterface {
  name = 'createCurrencyRate1705400314114';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`currency_rate\` 
      (\`id\` int NOT NULL AUTO_INCREMENT, 
      \`currency\` varchar(3) NOT NULL, 
      \`rate\` float NOT NULL, 
      \`updated_at\` timestamp NOT NULL, 
      UNIQUE INDEX \`IDX_2fd72ffba2780c17c276d1d691\` (\`currency\`), 
      PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `IDX_2fd72ffba2780c17c276d1d691` ON `currency_rate`',
    );
    await queryRunner.query('DROP TABLE `currency_rate`');
  }
}
