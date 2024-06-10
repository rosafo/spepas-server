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
import { convertHeaders } from '../../../utils/helper';

@Resolver()
export class SellerResolver {
  constructor(private sellerService: CustomSellerService) {}

  @Query()
  @Allow(Permission.Owner)
  async getSeller(@Ctx() ctx: RequestContext): Promise<CustomSeller | null> {
    const headers = convertHeaders(ctx.req?.headers || {});
    return this.sellerService.findSellerById(ctx, headers);
  }
 
}
