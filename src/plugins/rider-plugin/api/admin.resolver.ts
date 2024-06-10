import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import {
  Allow,
  Ctx,
  Permission,
  RequestContext,
  Transaction
} from '@vendure/core';
import { Rider } from '../entities/rider.entity';
import { RiderService } from '../services/rider.service';

@Resolver()
export class AdminRiderResolver {
    constructor(private riderService: RiderService) { }

    @Query()
    @Allow(Permission.Owner)
    async pendingRiders(@Ctx() ctx: RequestContext): Promise<Rider[] | []> {
        return this.riderService.fetchPendingRiders(ctx);
    }


    @Mutation()
    @Transaction()
    @Allow(Permission.Owner)
    async processRiderRequest(
        @Ctx() ctx: RequestContext,
        @Args('id') id: string,
        @Args('decision') decision: 'approve' | 'reject'
    ): Promise<{ success: boolean; message?: string }> {
        return this.riderService.processRiderRequest(ctx, id, decision);
    }

}