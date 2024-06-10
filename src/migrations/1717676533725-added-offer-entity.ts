import {MigrationInterface, QueryRunner} from "typeorm";

export class AddedOfferEntity1717676533725 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "customer_product_request" DROP CONSTRAINT "FK_9e591069bbd36d35e185fb21bfb"`, undefined);
        await queryRunner.query(`ALTER TABLE "customer_product_request" RENAME COLUMN "bestBidSellerId" TO "status"`, undefined);
        await queryRunner.query(`CREATE TABLE "offer" ("id" SERIAL NOT NULL, "price" double precision NOT NULL, "deliveryTime" character varying NOT NULL, "status" text, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, "offerImageId" integer, "sellerId" integer, "productRequestId" integer, CONSTRAINT "PK_57c6ae1abe49201919ef68de900" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "customer_product_request" DROP COLUMN "status"`, undefined);
        await queryRunner.query(`ALTER TABLE "customer_product_request" ADD "status" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "offer" ADD CONSTRAINT "FK_c570c1bd300dcb14fde34499f05" FOREIGN KEY ("sellerId") REFERENCES "custom_seller"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "offer" ADD CONSTRAINT "FK_23e69c6a777d457d09bbaeef27e" FOREIGN KEY ("offerImageId") REFERENCES "asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "offer" ADD CONSTRAINT "FK_b7ec2cc4601b3de5ac5dafa01f6" FOREIGN KEY ("productRequestId") REFERENCES "customer_product_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "offer" DROP CONSTRAINT "FK_b7ec2cc4601b3de5ac5dafa01f6"`, undefined);
        await queryRunner.query(`ALTER TABLE "offer" DROP CONSTRAINT "FK_23e69c6a777d457d09bbaeef27e"`, undefined);
        await queryRunner.query(`ALTER TABLE "offer" DROP CONSTRAINT "FK_c570c1bd300dcb14fde34499f05"`, undefined);
        await queryRunner.query(`ALTER TABLE "customer_product_request" DROP COLUMN "status"`, undefined);
        await queryRunner.query(`ALTER TABLE "customer_product_request" ADD "status" integer`, undefined);
        await queryRunner.query(`DROP TABLE "offer"`, undefined);
        await queryRunner.query(`ALTER TABLE "customer_product_request" RENAME COLUMN "status" TO "bestBidSellerId"`, undefined);
        await queryRunner.query(`ALTER TABLE "customer_product_request" ADD CONSTRAINT "FK_9e591069bbd36d35e185fb21bfb" FOREIGN KEY ("bestBidSellerId") REFERENCES "custom_seller"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
   }

}
