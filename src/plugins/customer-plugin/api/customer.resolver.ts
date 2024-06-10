import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import {
  Ctx,
  RequestContext,
  Transaction,
  ID,
} from '@vendure/core';
import { CustomerService } from '../services/customer.service';
import { CustomCustomer } from '../entities/customer.entity';
import { convertHeaders } from '../../../utils/helper';



export type AddressInput = {
  title: string;
  city: string;
  password: string;
  street: string;
  gps: string;
};

export type EditAddressInput = {
  id: ID;
  title: String;
  city: String;
  street: String;
  gps: String;
};
export type DeleteAddressInput = {
  id: ID;
};



@Resolver('CustomCustomer')
export class CustomerResolver {
  constructor(
    private customerService: CustomerService,
  ) {}

  @Query()
  async customer(@Ctx() ctx: RequestContext): Promise<CustomCustomer | null> {
    const headers = convertHeaders(ctx.req?.headers || {});
    return this.customerService.findCustomerById(ctx, headers);
  }

  @Mutation()
  @Transaction()
  async addAddress(
    @Ctx() ctx: RequestContext,
    @Args('input') input: AddressInput
  ): Promise<CustomCustomer> {
    const headers = convertHeaders(ctx.req?.headers || {});
    const { title, city, street, gps } = input;
    return this.customerService.manageAddress(
      ctx,
      title,
      city,
      street,
      gps,
      headers
    );
  }

  @Mutation()
  @Transaction()
  async editAddress(
    @Ctx() ctx: RequestContext,
    @Args('input') input: EditAddressInput
  ): Promise<CustomCustomer> {
    const headers = convertHeaders(ctx.req?.headers || {});
    return this.customerService.editAddress(ctx, input, headers);
  }

  @Mutation()
  @Transaction()
  async deleteAddress(
    @Ctx() ctx: RequestContext,
    @Args('input') input: DeleteAddressInput
  ): Promise<CustomCustomer> {
    const headers = convertHeaders(ctx.req?.headers || {});
    return this.customerService.deleteAddress(ctx, input, headers);
  }

}
