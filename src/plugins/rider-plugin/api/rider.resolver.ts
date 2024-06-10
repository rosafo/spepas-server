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
import { convertHeaders } from '../../../utils/helper';

@Resolver()
export class RiderResolver {
  constructor(private riderService: RiderService) {}

  @Query()
  async rider(@Ctx() ctx: RequestContext): Promise<Rider | null> {
    const headers = convertHeaders(ctx.req?.headers || {});
    return this.riderService.fetchRider(ctx, headers);
  }

  @Mutation()
  @Transaction()
  async setRiderOnline(@Ctx() ctx: RequestContext): Promise<boolean> {
    const headers = convertHeaders(ctx.req?.headers || {});
    return this.riderService.setRiderOnline(ctx, headers);
  }
}
