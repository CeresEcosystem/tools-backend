import { MigrationInterface, QueryRunner } from "typeorm";

export class migrations1704879786625 implements MigrationInterface {
    name = 'migrations1704879786625'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reserves\` DROP COLUMN \`balance\``);
        await queryRunner.query(`ALTER TABLE \`reserves\` ADD \`balance\` bigint NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reserves\` DROP COLUMN \`balance\``);
        await queryRunner.query(`ALTER TABLE \`reserves\` ADD \`balance\` int NOT NULL`);
    }

}
