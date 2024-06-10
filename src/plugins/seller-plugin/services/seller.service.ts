import { Injectable } from '@nestjs/common';
import {
  RequestContext,
  TransactionalConnection,
  RequestContextService,
  isGraphQlErrorResult,
  AssetService
} from '@vendure/core';
import { CustomSeller } from '../entities/seller.entity';
import { SellerInput } from '../types';
import { SmsService } from '../../../utils/communication/sms/sms.service';
import { MultivendorService } from '../../multivendor-plugin/services/multi.vendor.service';
import { generatePassword } from '../../../utils/helper';
import { AuthMiddleware } from '../../../middlewares/auth.middleware';

@Injectable()
export class CustomSellerService {
  constructor(
    private connection: TransactionalConnection,
    private smsService: SmsService,
    private requestContextService: RequestContextService,
    private assetService: AssetService,
    private multivendorService: MultivendorService,
    private readonly authMiddleware: AuthMiddleware

  ) {}

  /**
   * Fetches a list of pending sellers from the database.
   *
   * @param {RequestContext} ctx - The request context.
   * @return {Promise<CustomSeller[]>} A promise that resolves to an array of CustomSeller objects representing the pending sellers.
   */
  async fetchPendingSellers(ctx: RequestContext): Promise<CustomSeller[] | []> {
    const adminCtx = await this.requestContextService.create({
      apiType: 'admin'
    });

    const sellers = await this.connection
      .getRepository(adminCtx, CustomSeller)
      .find({
        where: { status: 'pending' }
      });

    for (const seller of sellers) {
      if (seller.avatarId) {
        const sellerAvatar = await this.assetService.findOne(
          ctx,
          seller.avatarId
        );
        if (sellerAvatar) {
          seller.avatar = sellerAvatar;
        }
      }

      if (seller.businessRegistrationFileId) {
        const businessRegistrationFile = await this.assetService.findOne(
          ctx,
          seller.businessRegistrationFileId
        );
        if (businessRegistrationFile) {
          seller.businessRegistrationFile = businessRegistrationFile;
        }
      }
    }

    return sellers;
  }

  /**
   * Process a seller request by either approving or rejecting it.
   *
   * @param {RequestContext} ctx - the request context
   * @param {string} id - the ID of the seller request
   * @param {'approve' | 'reject'} decision - the decision to approve or reject the seller request
   * @return {Promise<string>} a string indicating the success of the operation
   */
  async processSellerRequest(
    ctx: RequestContext,
    id: string,
    decision: 'approve' | 'reject'
  ): Promise<string> {
    const adminCtx = await this.requestContextService.create({
      apiType: 'admin'
    });
    const seller = await this.connection
      .getRepository(adminCtx, CustomSeller)
      .findOne({
        where: { id: id }
      });

    if (!seller) {
      throw new Error(`Seller with ID ${id} not found`);
    }

    const password = generatePassword();

    let message: string;
    if (decision === 'approve') {
      // Trigger registration process for the seller
      const createdSeller = await this.multivendorService.registerNewSeller(
        ctx,
        {
          shopName: seller.shopName,
          seller: {
            firstName: seller.fullName.split(' ')[0],
            lastName: seller.fullName.split(' ')[1],
            emailAddress: seller.email,
            password: password
          }
        }
      );

      seller.status = 'approved';
      message =
        `Your account has been approved. Welcome to our platform!` +
        `You can login using your credentials.` +
        `Username: ${seller.email} \n\n` +
        `Temporary Password: ${password}  \n\n` +
        `Please login using the provided credentials and reset your password.`;

      await this.smsService.sendSms(seller.phone, message);
    } else if (decision === 'reject') {
      seller.status = 'rejected';
      message =
        'Unfortunately, your seller account request has been rejected. Please contact support for further information.';
      await this.smsService.sendSms(seller.phone, message);
    } else {
      throw new Error(
        'Invalid decision. Decision must be either "approve" or "reject".'
      );
    }

    await this.connection.getRepository(adminCtx, CustomSeller).save(seller);
    return 'SUCCESS';
  }


  async findSellerById(
    ctx: RequestContext,
    headers: Record<string, string | string[]>
  ): Promise<CustomSeller | null> {
    try {
      const decodedToken = this.authMiddleware.verifyToken(headers);
      if (!decodedToken || !decodedToken.id) {
        console.error('Invalid or missing token');
        return null;
      }

      const userId = decodedToken.id;
      const userRepository = this.connection.getRepository(ctx, CustomSeller);
      const seller = await userRepository.findOne({
        where: { userId: userId },
        relations: [
          'productRequests',
          'productRequests.productRequestImage'
        ]
      });

      if (seller && seller.avatarId) {
        const avatar = await this.assetService.findOne(ctx, seller.avatarId);
        if (avatar) {
          seller.avatar = avatar;
        }
      }

      return seller;
    } catch (error) {
      console.error('Error finding customer by ID:', error);
      return null;
    }
  }

}
