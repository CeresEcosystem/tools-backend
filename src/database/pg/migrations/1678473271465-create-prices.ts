import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePrices1678473271465 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS prices_id_seq; \
       CREATE TABLE IF NOT EXISTS "public"."prices" (
          "id" int8 NOT NULL DEFAULT nextval('prices_id_seq'::regclass),
          "token" varchar(8) NOT NULL,
          "price" float8 NOT NULL DEFAULT 0,
          "created_at" timestamptz NOT NULL DEFAULT timezone('Europe/Belgrade'::text, now()),
          PRIMARY KEY ("id")
       );`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE prices');
  }
}
