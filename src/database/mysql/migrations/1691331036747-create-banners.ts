import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBanners1691331036747 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS banners ( 
            id int NOT NULL AUTO_INCREMENT,
            sm varchar(200) DEFAULT NULL,
            md varchar(200) DEFAULT NULL,
            lg varchar(200) DEFAULT NULL,
            link varchar(200) DEFAULT NULL,
            title varchar(100) DEFAULT NULL,
            device varchar(20) DEFAULT NULL,
            is_deleted tinyint DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        );`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE banners');
  }
}
