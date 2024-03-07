import { Injectable } from '@nestjs/common';
import {
  RequestContext,
  TransactionalConnection,
  RequestContextService
} from '@vendure/core';
import { CustomSeller } from '../entities/seller.entity';
import { SellerInput } from '../types';
import { SmsService } from '../communication/sms/sms.service';
import { MultivendorService } from '../../multivendor-plugin/services/multi.vendor.service';
import {generatePassword} from '../../utils/helper'
@Injectable()
export class CustomSellerService {
  constructor(
    private connection: TransactionalConnection,
    private smsService: SmsService,
    private requestContextService: RequestContextService,
    private multivendorService: MultivendorService
  ) {}

  async createNewSeller(
    ctx: RequestContext,
    input: { shopName: string; seller: SellerInput }
  ): Promise<string> {
    const {
      fullName,
      emailAddress,
      phone,
      TIN,
      shopAddress,
      aboutShop,
    } = input.seller;

    // Create a new CustomSeller entity with the submitted details
    const newSeller = new CustomSeller();
    newSeller.shopName = input.shopName;
    newSeller.fullName = fullName;
    newSeller.emailAddress = emailAddress;
    newSeller.phone = phone;
    newSeller.TIN = TIN;
    newSeller.shopAddress = shopAddress;
    newSeller.aboutShop = aboutShop;
    // Save the seller entity
    await this.connection.getRepository(ctx, CustomSeller).save(newSeller);

    // Send SMS notification to the seller
    const message =
      'Your details have been successfully submitted. We will review them and get back to you as soon as possible. Thank you for your submission!';
    await this.smsService.sendSms(phone, message);

    return 'SUCCESS';
  }

  async fetchPendingSellers(ctx: RequestContext): Promise<CustomSeller[]> {
    const adminCtx = await this.requestContextService.create({
      apiType: 'admin'
    });
    return this.connection.getRepository(adminCtx, CustomSeller).find({
      where: { status: 'pending' }
    });
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
        where: { id: Number(id) }
      });

    if (!seller) {
      throw new Error(`Seller with ID ${id} not found`);
    }
    
    const password = generatePassword();

    let message: string;
    if (decision === 'approve') {
      // Trigger registration process for the seller
     const createdSeller =  await this.multivendorService.registerNewSeller(ctx, {
        shopName: seller.shopName,
        seller: {
          firstName: seller.fullName.split(' ')[0],
          lastName: seller.fullName.split(' ')[1],
          emailAddress: seller.emailAddress,
          password: password
        }
      });
       
      seller.status = 'approved';
       message =`Your account has been approved. Welcome to our platform!` +
      `You can login using your credentials.`+
         `Username: ${seller.emailAddress} \n\n` +
         `Temporary Password: ${password}  \n\n` +
      `Please login using the provided credentials and reset your password.`;
      
      await this.smsService.sendSms(seller.phone, message);
      console.log(createdSeller)
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
}
