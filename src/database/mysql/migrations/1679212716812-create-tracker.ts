import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTracker1679212716812 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS tracker ( \
            id int NOT NULL AUTO_INCREMENT, \
            block_num  bigint DEFAULT '0', \
            xor_spent float DEFAULT '0', \
            pswap_gross_burn float DEFAULT '0', \
            pswap_reminted_lp float DEFAULT '0', \
            pswap_reminted_parliament float DEFAULT '0', \
            pswap_net_burn float DEFAULT '0', \
            created_at datetime DEFAULT NULL, \
            updated_at datetime DEFAULT NULL, \
            date_raw date DEFAULT NULL, \
            PRIMARY KEY (id), \
            UNIQUE KEY block_num_UNIQUE (block_num)
        );`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE tracker');
  }
}
