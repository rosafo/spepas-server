import { Args, Mutation, Resolver } from '@nestjs/graphql';
import {
    Ctx,
    Customer,
    ListQueryBuilder,
    Product,
    ProductVariant,
    RequestContext,
    Transaction,
    TransactionalConnection,
} from '@vendure/core';

import { ProductReview } from '../entities/product-review.entity';
import { MutationSubmitProductReviewArgs, MutationVoteOnReviewArgs } from '../generated-shop-types';

@Resolver()
export class ProductReviewShopResolver {
    constructor(private connection: TransactionalConnection, private listQueryBuilder: ListQueryBuilder) {}

    @Transaction()
    @Mutation()
    async submitProductReview(
        @Ctx() ctx: RequestContext,
        @Args() { input }: MutationSubmitProductReviewArgs,
    ) {
        // Fetch the customer's transactions
        // const customerId = input.customerId;
        // const transactions = await this.connection.getRepository(ctx, Transaction).find({
        //     where: { customerId: customerId },
        //     relations: ['order'], 
        // });

        // // Check if there's a qualifying purchase
        // let hasQualifyingPurchase = false;
        // for (const transaction of transactions) {
        //     // Define your own logic for determining a qualifying purchase
        //     if (transaction.order && transaction.order.items.length > 0) {
        //         hasQualifyingPurchase = true;
        //         break;
        //     }
        // }

        // if (!hasQualifyingPurchase) {
        //     throw new Error('Customer has not made a qualifying purchase');
        // }

        const review = new ProductReview(input);
        const product = await this.connection.getEntityOrThrow(ctx, Product, input.productId);
        review.product = product;
        review.state = 'new';
        if (input.variantId) {
            const variant = await this.connection.getEntityOrThrow(ctx, ProductVariant, input.variantId);
            review.productVariant = variant;
        }
        if (input.customerId) {
            const customer = await this.connection.getEntityOrThrow(ctx, Customer, input.customerId);
            review.author = customer;
        }
        return this.connection.getRepository(ctx, ProductReview).save(review);
    }

    @Transaction()
    @Mutation()
    async voteOnReview(@Ctx() ctx: RequestContext, @Args() { id, vote }: MutationVoteOnReviewArgs) {
        const review = await this.connection.getEntityOrThrow(ctx, ProductReview, id, {
            relations: ['product'],
            where: {
                state: 'approved',
            },
        });
        if (vote) {
            review.upvotes++;
        } else {
            review.downvotes++;
        }
        return this.connection.getRepository(ctx, ProductReview).save(review);
    }
}
