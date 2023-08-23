import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTokenOrderColumns1692736089305 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE token_order 
        MODIFY COLUMN created_at datetime DEFAULT CURRENT_TIMESTAMP,
        MODIFY COLUMN updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE token_order 
          MODIFY COLUMN created_at datetime NOT NULL,
          MODIFY COLUMN updated_at datetime NOT NULL`,
    );
  }
}
