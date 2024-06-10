import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { Ctx, RequestContext, Transaction } from '@vendure/core';
import { UserService } from '../services/account.manager.service';
import { CustomUser } from '../entities/user.entity';
import { convertHeaders } from '../../../utils/helper';
import { UserRole } from '../entities/role.entity';
import {
  CompleteAccountCreationInput,
  LoginInput,
  InitiateAccountCreationInput,
  OtpInput,
  InitiatePasswordResetInput,
  ResetPasswordInput,
  ChangePasswordInput
} from '../dto/user-input.dto';

@Resolver('User')
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query()
  async getCurrentUser(@Ctx() ctx: RequestContext): Promise<CustomUser | null> {
    const headers = convertHeaders(ctx.req?.headers || {});
    return this.userService.findUserById(ctx, headers);
  }

  @Mutation()
  @Transaction()
  async customLogin(
    @Ctx() ctx: RequestContext,
    @Args('input') input: LoginInput
  ): Promise<{ token: string; user: CustomUser }> {
    return this.userService.customLogin(ctx, input);
  }

  @Mutation()
  @Transaction()
  async resendOtp(
    @Ctx() ctx: RequestContext,
    @Args('input') input: { phone: string }
  ): Promise<{ success: boolean; message?: string }> {
    return this.userService.resendOtp(ctx, input);
  }

  @Mutation()
  @Transaction()
  async switchAccount(
    @Ctx() ctx: RequestContext,
    @Args('newRole', { type: () => UserRole }) newRole: UserRole
  ): Promise<{ token: string; user: CustomUser }> {
    const headers = convertHeaders(ctx.req?.headers || {});
    return this.userService.switchAccount(ctx, newRole, headers);
  }

  @Mutation()
  @Transaction()
  async initiateAccountCreation(
    @Ctx() ctx: RequestContext,
    @Args('input') input: InitiateAccountCreationInput
  ): Promise<{ success: boolean; message?: string }> {
    return this.userService.initiateAccountCreation(ctx, input);
  }

  @Mutation()
  @Transaction()
  async createAccount(
    @Ctx() ctx: RequestContext,
    @Args('input') input: CompleteAccountCreationInput
  ): Promise<any> {
    const headers = convertHeaders(ctx.req?.headers || {});
    return this.userService.createAccount(ctx, input, headers);
  }

  @Mutation()
  @Transaction()
  async verifyOtp(
    @Ctx() ctx: RequestContext,
    @Args('input') input: OtpInput
  ): Promise<{ token: string }> {
    return this.userService.verifyOtp(ctx, input);
  }

  @Mutation()
  @Transaction()
  async initiatePasswordReset(
    @Ctx() ctx: RequestContext,
    @Args('input') input: InitiatePasswordResetInput
  ): Promise<{ success: boolean; message?: string }> {
    return this.userService.initiatePasswordReset(ctx, input);
  }

  @Mutation()
  @Transaction()
  async resetUserPassword(
    @Ctx() ctx: RequestContext,
    @Args('input') input: ResetPasswordInput
  ): Promise<{ success: boolean; message?: string }> {
    const headers = convertHeaders(ctx.req?.headers || {});
    return this.userService.resetUserPassword(ctx, input, headers);
  }

  @Mutation()
  @Transaction()
  async uploadProfilePicture(
    @Ctx() ctx: RequestContext,
    @Args() args: { file: any }
  ): Promise<any> {
    const headers = convertHeaders(ctx.req?.headers ? Object.fromEntries(Object.entries(ctx.req.headers)) : {});
    return this.userService.uploadProfilePicture(ctx, args.file, headers);
  }

  @Mutation()
  @Transaction()
  async changePassword(
    @Ctx() ctx: RequestContext,
    @Args('input') input: ChangePasswordInput
  ): Promise<CustomUser> {
    const headers = convertHeaders(ctx.req?.headers ? Object.fromEntries(Object.entries(ctx.req.headers)) : {});
    return this.userService.changePassword(ctx, input, headers);
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
  ): Promise<CustomUser> {
    const headers = convertHeaders(ctx.req?.headers ? Object.fromEntries(Object.entries(ctx.req.headers)) : {});
    return this.userService.changeContact(ctx, input, headers);
  }
}
