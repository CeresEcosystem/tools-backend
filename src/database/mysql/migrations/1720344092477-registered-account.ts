import { MigrationInterface, QueryRunner } from 'typeorm';

export class RegisteredAccount1720344092477 implements MigrationInterface {
  name = 'RegisteredAccount1720344092477';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`registered_account\` (
      \`id\` int NOT NULL AUTO_INCREMENT, 
      \`account_id\` varchar(60) NOT NULL, 
      UNIQUE INDEX \`IDX_a124410d2987c0a575759a40b4\` (\`account_id\`), 
      PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `registered_account`');
  }
}
