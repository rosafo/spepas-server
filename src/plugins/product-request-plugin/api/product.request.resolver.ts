import { Resolver, Args, Mutation, Query } from '@nestjs/graphql';
import { Ctx, RequestContext, Transaction } from '@vendure/core';
import { ProductRequestInput, EditRequestInput, OfferInput } from '../types';
import { ProductRequestService } from '../services/product-request.service';
import { OfferService } from '../services/offer.service';
import { convertHeaders } from '../../../utils/helper';

@Resolver()
export class ProductRequestResolver {
  constructor(
    private productRequestService: ProductRequestService,
    private offerService: OfferService
  ) {}

  @Query()
  getProductRequest(@Ctx() ctx: RequestContext) {
    const headers = convertHeaders(ctx.req?.headers || {});
    return this.productRequestService.getProductRequest(ctx, headers);
  }

  @Query()
  getProductRequestsForSellers(@Ctx() ctx: RequestContext) {
    return this.productRequestService.getProductRequestsForSellers(ctx);
  }

  @Query()
  getOffersForProductRequest(
    @Ctx() ctx: RequestContext,
    @Args('productRequestId') productRequestId: string
  ) {
    return this.offerService.getOffersForProductRequest(ctx, productRequestId);
  }

  @Mutation()
  async submitProductRequest(
    @Ctx() ctx: RequestContext,
    @Args('input') input: ProductRequestInput,
    @Args() args: { file: any }
  ): Promise<{ success: boolean; message?: string }> {
    const headers = convertHeaders(ctx.req?.headers || {});
    return this.productRequestService.submitProductRequest(
      ctx,
      input,
      args.file,
      headers
    );
  }

  @Mutation()
  async submitOffer(
    @Ctx() ctx: RequestContext,
    @Args('input') input: OfferInput,
  ): Promise<{ success: boolean; message?: string }> {
    const headers = convertHeaders(ctx.req?.headers || {});
    return this.offerService.submitOffer(ctx, input, headers);
  }

  @Mutation()
  @Transaction()
  async processOffer(
      @Ctx() ctx: RequestContext,
      @Args('offerId') id: string,
      @Args('decision') decision: 'accept' | 'dismiss'
  ): Promise<{ success: boolean; message?: string }> {
      const headers = convertHeaders(ctx.req?.headers || {});
      return this.offerService.processOffer(ctx, id, decision);
  }

  @Mutation()
  @Transaction()
  async deleteProductRequest(
    @Ctx() ctx: RequestContext,
    @Args() { itemId }: { itemId: string }
  ) {
    const headers = convertHeaders(ctx.req?.headers || {});
    return this.productRequestService.deleteProductRequest(
      ctx,
      itemId,
      headers
    );
  }

  @Mutation()
  @Transaction()
  async editProductRequest(
    @Ctx() ctx: RequestContext,
    @Args('input') input: EditRequestInput,
    @Args() args: { file: any }
  ) {
    const headers = convertHeaders(ctx.req?.headers || {});
    return this.productRequestService.editProductRequest(
      ctx,
      input,
      args.file,
      headers
    );
  }
}
