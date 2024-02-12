import { Args, Mutation, Resolver } from '@nestjs/graphql';
// import  { GraphQLUpload,FileUpload}  from 'graphql-upload';
import { Stream } from 'stream';

import {
  Ctx,
  RequestContext,
  Transaction,
  ID,
} from '@vendure/core';
import { CustomerService } from '../services/customer.service';
import { CustomCustomer } from '../entities/customer.entity';

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
}
  
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
  userId: string;
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
      userId: string;
      otp: string;
      phone: string;
      fullName: string;
      city: string;
      street: string;
      gps: string;
      profilePicture?: { file: any };
    }
  ): Promise<{ token: string, user: CustomCustomer }> {
    return this.customerService.completeAccountCreation(ctx, input);
  }

  @Mutation()
  @Transaction()
  async customLogin(
    @Ctx() ctx: RequestContext,
    @Args('input') input: CustomLoginInput
  ): Promise<{ token: string, user: CustomCustomer }> {
    return this.customerService.customLogin(ctx, input);
  }

  @Mutation()
  @Transaction()
  async changePassword(
    @Ctx() ctx: RequestContext,
    @Args('userId') userId: ID,
    @Args('oldPassword') oldPassword: string,
    @Args('newPassword') newPassword: string
  ): Promise<CustomCustomer> {
    return this.customerService.changePassword(
      ctx,
      userId,
      oldPassword,
      newPassword
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

  @Mutation()
  @Transaction()
  async resetUserPassword(
    @Ctx() ctx: RequestContext,
    @Args('input') input: ResetUserPasswordInput
  ): Promise<CustomCustomer> {
    return this.customerService.resetUserPassword(ctx, input);
  }

  @Mutation()
  @Transaction()
  async uploadProfilePicture(
    @Ctx() ctx: RequestContext,
    @Args('input') input: ProfilePictureUploadInput
  ): Promise<CustomCustomer> {
    return this.customerService.uploadProfilePicture(ctx, input);
  }
}
