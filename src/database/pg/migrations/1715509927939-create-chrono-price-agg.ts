import { MigrationInterface, QueryRunner } from 'typeorm';

export class createChronoPriceAgg1715509927939 implements MigrationInterface {
  name = 'createChronoPriceAgg1715509927939';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "prices_agg" (
        "id" SERIAL NOT NULL, 
        "token" varchar(8) NOT NULL, 
        "resolution" varchar(4) NOT NULL, 
        "period_date" TIMESTAMP NOT NULL, 
        "period_epoch" bigint NOT NULL,
        "open" double precision NOT NULL, 
        "close" double precision NOT NULL, 
        "high" double precision NOT NULL, 
        "low" double precision NOT NULL, 
        "created_at" timestamptz NOT NULL DEFAULT timezone('Europe/Belgrade'::text, now()),
        CONSTRAINT "PK_91b139fab4db76f02240672da97" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_f398fc7f7c9bb58984dbadcf60" ON "prices_agg" ("token", "period_epoch", "resolution") ',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX "public"."IDX_f398fc7f7c9bb58984dbadcf60"',
    );
    await queryRunner.query('DROP TABLE "prices_agg"');
  }
}
