import { Injectable, NotFoundException } from '@nestjs/common';
import {
  RequestContext,
  TransactionalConnection,
  isGraphQlErrorResult,
  AssetService
} from '@vendure/core';
import { ReportIssueInput } from '../types';
import { Report } from '../entities/report.entity';
// import { PushNotificationService } from './notification.service';
import { AuthMiddleware } from '../../../middlewares/auth.middleware';
import { CustomCustomer } from '../../customer-plugin/entities/customer.entity';

@Injectable()
export class ReportService {
  constructor(
    private connection: TransactionalConnection,
    // private pushNotificationService: PushNotificationService,
    private assetService: AssetService,
    private authMiddleware: AuthMiddleware
  ) {}

  async reportIssue(
    ctx: RequestContext,
    input: ReportIssueInput,
    file: any,
    headers: Record<string, string | string[]>
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const decodedToken = this.authMiddleware.verifyToken(headers);
      const userId = decodedToken.id;

      const userRepository = this.connection.getRepository(ctx, CustomCustomer);
      const reportRepository = this.connection.getRepository(ctx, Report);

      // Find the user
      const user = await userRepository.findOne({
        where: { userId: userId },
        relations: ['reports']
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Create an Asset from the uploaded file
      const asset = await this.assetService.create(ctx, {
        file,
        tags: ['itemImage']
      });

      if (isGraphQlErrorResult(asset)) {
        throw asset;
      }

      // Create a new Report entity
      const report = new Report();
      report.orderNumber = input.orderNumber;
      report.issueType = input.issueType;
      report.description = input.description;
      report.itemImageId = Number(asset.id);

      // Save the report entity to the database
      const savedReport = await reportRepository.save(report);
      // await this.notifyAdminsAboutNewReport(report);

      // Update user's reports
      user.reports.push(savedReport);
      await userRepository.save(user);

      return { success: true, message: 'Report submitted successfully' };
    } catch (error) {
      console.error('Error reporting issue:', error);
      return {
        success: false,
        message: 'An error occurred while reporting the issue'
      };
    }
  }

  private async notifyAdminsAboutNewReport(report: Report) {
    // Logic for notifying admins about the new report
  }
}
