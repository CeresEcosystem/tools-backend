import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSymbols1678568504333 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS symbols ( \
            id varchar(10) NOT NULL, \
            name varchar(10) DEFAULT NULL, \
            \`exchange-traded\` varchar(100) DEFAULT 'Polkaswap', \
            \`exchange-listed\` varchar(100) DEFAULT 'Polkaswap', \
            timezone varchar(100) DEFAULT 'Europe/Belgrade', \
            minmovement tinyint(1) DEFAULT '1', \
            minmovement2 tinyint(1) DEFAULT '0', \
            pricescale bigint DEFAULT NULL, \
            \`has-dwm\` tinyint DEFAULT '1', \
            \`has-intraday\` tinyint(1) DEFAULT '1', \
            \`has-no-volume\` tinyint(1) DEFAULT '1', \
            description varchar(100) NOT NULL, \
            type varchar(30) DEFAULT 'crypto', \
            ticker varchar(10) NOT NULL, \
            created_at datetime DEFAULT CURRENT_TIMESTAMP, \
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \
            PRIMARY KEY (id)
        )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE symbols');
  }
}
