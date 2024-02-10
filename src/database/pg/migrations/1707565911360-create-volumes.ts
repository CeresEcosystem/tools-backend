import { MigrationInterface, QueryRunner } from 'typeorm';

export class createVolumes1707565911360 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "volumes" (
          "id" SERIAL NOT NULL, 
          "token" varchar(8) NOT NULL, 
          "volume" numeric(16,2) NOT NULL DEFAULT 0, 
          "created_at" timestamptz NOT NULL DEFAULT timezone('Europe/Belgrade'::text, now()),
          PRIMARY KEY ("id")
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "volumes"');
  }
}
