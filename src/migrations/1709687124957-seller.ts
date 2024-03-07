import {MigrationInterface, QueryRunner} from "typeorm";

export class seller1709687124957 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "seller" ADD "customFieldsBusinessregistratonfileid" integer`, undefined);
        await queryRunner.query(`ALTER TABLE "seller" ADD "customFieldsProfilepictureid" integer`, undefined);
        await queryRunner.query(`ALTER TABLE "seller" ADD "customFieldsFullname" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "seller" ADD "customFieldsPhone" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "seller" ADD "customFieldsShopaddress" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "seller" ADD "customFieldsAboutshop" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "seller" ADD CONSTRAINT "FK_e18ddfbcf1d72a6ce63492f8987" FOREIGN KEY ("customFieldsBusinessregistratonfileid") REFERENCES "asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "seller" ADD CONSTRAINT "FK_d2e9eb8b9c2946308c8890c1d28" FOREIGN KEY ("customFieldsProfilepictureid") REFERENCES "asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "seller" DROP CONSTRAINT "FK_d2e9eb8b9c2946308c8890c1d28"`, undefined);
        await queryRunner.query(`ALTER TABLE "seller" DROP CONSTRAINT "FK_e18ddfbcf1d72a6ce63492f8987"`, undefined);
        await queryRunner.query(`ALTER TABLE "seller" DROP COLUMN "customFieldsAboutshop"`, undefined);
        await queryRunner.query(`ALTER TABLE "seller" DROP COLUMN "customFieldsShopaddress"`, undefined);
        await queryRunner.query(`ALTER TABLE "seller" DROP COLUMN "customFieldsPhone"`, undefined);
        await queryRunner.query(`ALTER TABLE "seller" DROP COLUMN "customFieldsFullname"`, undefined);
        await queryRunner.query(`ALTER TABLE "seller" DROP COLUMN "customFieldsProfilepictureid"`, undefined);
        await queryRunner.query(`ALTER TABLE "seller" DROP COLUMN "customFieldsBusinessregistratonfileid"`, undefined);
   }

}
