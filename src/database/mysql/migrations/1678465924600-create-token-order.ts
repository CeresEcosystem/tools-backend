import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTokenOrder1678465924600 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS token_order ( \
            symbol varchar(10) NOT NULL, \
            \`order\` int NOT NULL, \
            created_at datetime NOT NULL, \
            updated_at datetime NOT NULL, \
            PRIMARY KEY (symbol) \
        )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE token_order`);
  }
}
