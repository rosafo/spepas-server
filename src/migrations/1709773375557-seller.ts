import {MigrationInterface, QueryRunner} from "typeorm";

export class seller1709773375557 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "custom_seller" ("id" SERIAL NOT NULL, "shopName" character varying(100) NOT NULL, "fullName" character varying(100) NOT NULL, "emailAddress" character varying, "phone" character varying(15) NOT NULL, "TIN" character varying(20) NOT NULL, "businessRegistrationFile" character varying, "profilePicture" character varying, "shopAddress" character varying(255) NOT NULL, "aboutShop" text NOT NULL, "password" character varying, "status" character varying NOT NULL DEFAULT 'pending', CONSTRAINT "PK_890d4bd6ebd6fbfabdd81faee3a" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "seller" ADD "customFieldsAvatarid" integer`, undefined);
        await queryRunner.query(`ALTER TABLE "seller" ADD CONSTRAINT "FK_65fac0ea28711bd039175f82f9e" FOREIGN KEY ("customFieldsAvatarid") REFERENCES "asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "seller" DROP CONSTRAINT "FK_65fac0ea28711bd039175f82f9e"`, undefined);
        await queryRunner.query(`ALTER TABLE "seller" DROP COLUMN "customFieldsAvatarid"`, undefined);
        await queryRunner.query(`DROP TABLE "custom_seller"`, undefined);
   }

}
