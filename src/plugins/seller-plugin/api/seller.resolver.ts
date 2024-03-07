import { Args, Mutation, Resolver ,Query} from '@nestjs/graphql';
import { Allow, Ctx, Permission, RequestContext, Transaction } from '@vendure/core';
import { CustomSellerService } from '../services/seller.service';
import { SellerInput } from '../types';
import { CustomSeller } from '../entities/seller.entity';
import { convertHeaders} from '../../utils/helper'
@Resolver()
export class SellerResolver {
    constructor(private sellerService: CustomSellerService) {}

    @Mutation()
    @Transaction()
    @Allow(Permission.Public)
    async createNewSeller(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: { shopName: string; seller: SellerInput } },
    ) {
        const headers = convertHeaders(ctx.req?.headers || {});
        const result = await this.sellerService.createNewSeller(ctx, args.input);
        return { message: result };
    }

    @Query()
    @Allow(Permission.Owner)
    async pendingSellers(@Ctx() ctx: RequestContext): Promise<CustomSeller[]> {
        return this.sellerService.fetchPendingSellers(ctx);
    }

    @Mutation()
    @Transaction()
    @Allow(Permission.Public)
    async processSellerRequest(
        @Ctx() ctx: RequestContext,
        @Args() args: { id: string, decision: 'approve' | 'reject' },
    ) {
        const result = await this.sellerService.processSellerRequest(ctx, args.id, args.decision);
        return { message: result };
    }    
}
