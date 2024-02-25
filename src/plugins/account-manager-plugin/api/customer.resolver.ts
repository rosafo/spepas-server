import { Args, Mutation, Resolver } from '@nestjs/graphql';
// import  { GraphQLUpload,FileUpload}  from 'graphql-upload';
import { Stream } from 'stream';

import { Ctx, RequestContext, Transaction, ID } from '@vendure/core';

import { CustomerService } from '../services/customer.service';
import { CustomCustomer } from '../entities/customer.entity';
import { IncomingHttpHeaders } from 'http';

function convertHeaders(
  headers: IncomingHttpHeaders
): Record<string, string[]> {
  return Object.entries(headers).reduce((acc, [key, value]) => {
    if (Array.isArray(value)) {
      acc[key] = value.filter((v) => typeof v === 'string') as string[];
    } else if (typeof value === 'string') {
      acc[key] = [value];
    }
    return acc;
  }, {} as Record<string, string[]>);
}

export type InitiateAccountCreationInput = {
  phone: string;
  password: string;
};

export type InitiatePasswordResetInput = {
  identifier: string;
};

export type FileUpload = {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => Stream;
};

export type VerifyPasswordRecoveryOtpInput = {
  otp: string;
};

export type ResetUserPasswordInput = {
  userId: string;
  newPassword: string;
};

export type CustomLoginInput = {
  identifier: string;
  password: string;
};

export type ProfilePictureUploadInput = {
  file: FileUpload;
};

@Resolver('CustomCustomer')
export class CustomerResolver {
  constructor(private customerService: CustomerService) {}

  @Mutation()
  @Transaction()
  async initiateAccountCreation(
    @Ctx() ctx: RequestContext,
    @Args('input') input: InitiateAccountCreationInput
  ): Promise<{ success: boolean; message?: string }> {
    return this.customerService.initiateAccountCreation(ctx, input);
  }

  @Mutation()
  @Transaction()
  async completeAccountCreation(
    @Ctx() ctx: RequestContext,
    @Args('input')
    input: {
      fullName: string;
      city: string;
      street: string;
      gps: string;
      profilePicture?: { file: any };
    }
  ): Promise<{ token: string; user: CustomCustomer }> {
    const headers = convertHeaders(ctx.req?.headers || {});
    return this.customerService.completeAccountCreation(ctx, input, headers);
  }

  @Mutation()
  @Transaction()
  async customLogin(
    @Ctx() ctx: RequestContext,
    @Args('input') input: CustomLoginInput
  ): Promise<{ token: string; user: CustomCustomer }> {
    return this.customerService.customLogin(ctx, input);
  }

  @Mutation()
  @Transaction()
  async changePassword(
    @Ctx() ctx: RequestContext,
    @Args('oldPassword') oldPassword: string,
    @Args('newPassword') newPassword: string
  ): Promise<CustomCustomer> {
    const headers = convertHeaders(ctx.req?.headers || {});
    return this.customerService.changePassword(
      ctx,
      oldPassword,
      newPassword,
      headers
    );
  }

  @Mutation()
  @Transaction()
  async changeContact(
    @Ctx() ctx: RequestContext,
    @Args('input')
    input: {
      currentContact: string;
      newContact: string;
      password: string;
    }
  ): Promise<CustomCustomer> {
    const headers = convertHeaders(ctx.req?.headers || {});
    return this.customerService.changeContact(ctx, input, headers);
  }

  @Mutation()
  @Transaction()
  async manageAddress(
    @Ctx() ctx: RequestContext,
    @Args('input')
    input: {
      title: string;
      city: string;
      password: string;
      street: string;
      gps: string;
    }
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
  async verifyOtp(
    @Ctx() ctx: RequestContext,
    @Args('input') input: { otp: string }
  ): Promise<{ token: string }> {
    return this.customerService.verifyOtp(ctx, input);
  }

  @Mutation()
  @Transaction()
  async initiatePasswordReset(
    @Ctx() ctx: RequestContext,
    @Args('input') input: InitiatePasswordResetInput
  ): Promise<{ success: boolean; message?: string }> {
    return this.customerService.initiatePasswordReset(ctx, input);
  }

  // Mutation definition
  @Mutation()
  @Transaction()
  async resetUserPassword(
    @Ctx() ctx: RequestContext,
    @Args('newPassword') newPassword: string
  ): Promise<CustomCustomer> {
    const headers = convertHeaders(ctx.req?.headers || {});
    return this.customerService.resetUserPassword(ctx, newPassword, headers);
  }

  @Mutation()
  @Transaction()
  async uploadProfilePicture(
    @Ctx() ctx: RequestContext,
    file: ProfilePictureUploadInput
  ): Promise<CustomCustomer> {
    const headers = convertHeaders(ctx.req?.headers || {});
    return this.customerService.uploadProfilePicture(ctx, file, headers);
  }
}
