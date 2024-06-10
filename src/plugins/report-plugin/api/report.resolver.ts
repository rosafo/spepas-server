import { Resolver, Args, Mutation } from '@nestjs/graphql';
import { RequestContext, Ctx } from '@vendure/core';
import { ReportIssueInput } from '../types';
import { ReportService } from '../services/report.service';
import { convertHeaders } from '../../../utils/helper';

@Resolver()
export class ReportResolver {
  constructor(private reportService: ReportService) {}

  @Mutation()
  async reportIssue(
    @Ctx() ctx: RequestContext,
    @Args('input') input: ReportIssueInput,
    @Args() args: { file: any }
  ): Promise<{ success: boolean; message?: string }> {
    const headers = convertHeaders(ctx.req?.headers || {});
    return this.reportService.reportIssue(ctx, input, args.file, headers);
  }
}
