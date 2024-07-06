import { MigrationInterface, QueryRunner } from 'typeorm';

export class PortfolioValue1720343695496 implements MigrationInterface {
  name = 'PortfolioValue1720343695496';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "portfolio_value" (
        "id" SERIAL NOT NULL, 
        "account_id" character varying NOT NULL, 
        "value" double precision NOT NULL, 
        "created_at" timestamptz NOT NULL DEFAULT timezone('Europe/Belgrade'::text, now()),
        CONSTRAINT "PK_d0e0a714f95117ca9a9ee47bcf1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_cf6c9681681aeffad14ac4046a" ON "portfolio_value" ("account_id", "created_at") ',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX "public"."IDX_cf6c9681681aeffad14ac4046a"',
    );
    await queryRunner.query('DROP TABLE "portfolio_value"');
  }
}
