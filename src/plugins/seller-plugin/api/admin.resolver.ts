import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import {
  Allow,
  Ctx,
  Permission,
  RequestContext,
  Transaction
} from '@vendure/core';
import { CustomSellerService } from '../services/seller.service';
import { CustomSeller } from '../entities/seller.entity';

@Resolver()
export class AdminSellerResolver {
  constructor(private sellerService: CustomSellerService) {}

  @Query()
  @Allow(Permission.Owner)
  async pendingSellers(
    @Ctx() ctx: RequestContext
  ): Promise<CustomSeller[] | []> {
    return this.sellerService.fetchPendingSellers(ctx);
  }


  @Mutation()
  @Transaction()
  @Allow(Permission.Owner)
  async processSellerRequest(
    @Ctx() ctx: RequestContext,
    @Args() args: { id: string; decision: 'approve' | 'reject' }
  ) {
    const result = await this.sellerService.processSellerRequest(
      ctx,
      args.id,
      args.decision
    );
    return { message: result };
  }
}
