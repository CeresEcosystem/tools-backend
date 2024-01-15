import { MigrationInterface, QueryRunner } from 'typeorm';

export class createCurrencyRate1705323354384 implements MigrationInterface {
  name = 'createCurrencyRate1705323354384';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`currency_rate\` 
      (\`id\` int NOT NULL AUTO_INCREMENT, 
      \`currency\` varchar(255) NOT NULL, 
      \`rate\` float NOT NULL, 
      \`updated_at\` timestamp NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `currency_rate`');
  }
}
