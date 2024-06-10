import {MigrationInterface, QueryRunner} from "typeorm";

export class AddedGeolocationAndRatingToRider1717970709556 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "rider" ADD "latitude" numeric(10,7)`, undefined);
        await queryRunner.query(`ALTER TABLE "rider" ADD "longitude" numeric(10,7)`, undefined);
        await queryRunner.query(`ALTER TABLE "rider" ADD "rating" numeric(2,1) DEFAULT '5'`, undefined);
        await queryRunner.query(`ALTER TABLE "custom_customer" ADD "orderId" integer`, undefined);
        await queryRunner.query(`ALTER TABLE "rider_request" DROP COLUMN "orderId"`, undefined);
        await queryRunner.query(`ALTER TABLE "rider_request" ADD "orderId" integer`, undefined);
        await queryRunner.query(`ALTER TABLE "rider_request" ADD CONSTRAINT "FK_072dc81657dab13d3c4a8f2c8c9" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "custom_customer" ADD CONSTRAINT "FK_1675cc102f04317fb10dedf0063" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "custom_customer" DROP CONSTRAINT "FK_1675cc102f04317fb10dedf0063"`, undefined);
        await queryRunner.query(`ALTER TABLE "rider_request" DROP CONSTRAINT "FK_072dc81657dab13d3c4a8f2c8c9"`, undefined);
        await queryRunner.query(`ALTER TABLE "rider_request" DROP COLUMN "orderId"`, undefined);
        await queryRunner.query(`ALTER TABLE "rider_request" ADD "orderId" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "custom_customer" DROP COLUMN "orderId"`, undefined);
        await queryRunner.query(`ALTER TABLE "rider" DROP COLUMN "rating"`, undefined);
        await queryRunner.query(`ALTER TABLE "rider" DROP COLUMN "longitude"`, undefined);
        await queryRunner.query(`ALTER TABLE "rider" DROP COLUMN "latitude"`, undefined);
   }

}
