import { MigrationInterface, QueryRunner } from 'typeorm';

export class createVolumes1707748370671 implements MigrationInterface {
  name = 'createVolumes1707748370671';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "volumes" (
        "id" SERIAL NOT NULL, 
        "token" character varying NOT NULL, 
        "volume" numeric(16,2) NOT NULL, 
        "volume_at" timestamptz NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT timezone('Europe/Belgrade'::text, now()),
        PRIMARY KEY ("id")
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "volumes"');
  }
}
