import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Ctx, RequestContext, Transaction } from '@vendure/core';
import { DeliveryService } from '../services/delivery.service';
import { convertHeaders } from '../../../utils/helper';
import { LocationInput, OrderDetails, DecisionResponse, DeliveryDetails,RiderDetails ,foundResponse} from '../types';

@Resolver()
export class DeliveryResolver {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Query()
  async getDeliveryDetails(
    @Ctx() ctx: RequestContext,
    @Args('orderId') orderId: string
  ): Promise<DeliveryDetails> {
    return this.deliveryService.getDeliveryDetails(ctx, orderId);
  }

  @Mutation()
  @Transaction()
  async findRider(
    @Ctx() ctx: RequestContext,
    @Args('orderId') orderId: string
  ): Promise<foundResponse> {
    const headers = convertHeaders(ctx.req?.headers || {});
    return this.deliveryService.findRider(ctx, orderId, headers);
  }

  @Mutation()
  @Transaction()
  async processRequest(
    @Ctx() ctx: RequestContext,
    @Args() args: { requestId: string; decision: 'accept' | 'dismiss' }
  ): Promise<DecisionResponse> {
    const headers = convertHeaders(ctx.req?.headers || {});
    return await this.deliveryService.processRequest(ctx, args.requestId, args.decision, headers);
  }

  @Mutation()
  @Transaction()
  async updateRiderLocation(
    @Ctx() ctx: RequestContext,
    @Args('riderId') riderId: string,
    @Args('location') location: LocationInput
  ): Promise<RiderDetails> {
    return this.deliveryService.updateRiderLocation(ctx, riderId, location);
  }

  @Mutation()
  @Transaction()
  async submitDeliveryProof(
    @Ctx() ctx: RequestContext,
    @Args('file') file: any
  ): Promise<any> {
    return await this.deliveryService.submitDeliveryProof(ctx, file);
  }

  @Mutation()
  @Transaction()
  async updateOrderStatus(
    @Ctx() ctx: RequestContext,
    @Args('orderId') orderId: string,
    @Args('status') status: string
  ): Promise<OrderDetails> {
    return this.deliveryService.updateOrderStatus(ctx, orderId, status);
  }
}
