import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import {
  RequestContext,
  TransactionalConnection,
  RequestContextService,
  isGraphQlErrorResult,
  AssetService
} from '@vendure/core';
import * as bcrypt from 'bcrypt';
import { Rider } from '../entities/rider.entity';
import { createToken, createTemporalToken } from '../../../utils/token-utils';
import { AuthMiddleware } from '../../../middlewares/auth.middleware';
import { SmsService } from '../../../utils/communication/sms/sms.service';
import { generatePassword } from '../../../utils/helper';
import { RiderInput } from '../types';

type OtpStoreEntry = {
  identifier: string;
  otp: string;
};

const otpStore: Record<string, OtpStoreEntry> = {};

@Injectable()
export class RiderService {
  constructor(
    private connection: TransactionalConnection,
    private requestContextService: RequestContextService,
    private assetService: AssetService,
    private smsService: SmsService,
    private authMiddleware: AuthMiddleware
  ) {}


  /**
   * Fetches a list of pending sellers from the database.
   *
   * @param {RequestContext} ctx - The request context.
   * @return {Promise<CustomSeller[]>} A promise that resolves to an array of CustomSeller objects representing the pending sellers.
   */
  async fetchPendingRiders(ctx: RequestContext): Promise<Rider[]> {
    const adminCtx = await this.requestContextService.create({
      apiType: 'admin'
    });

    const riders = await this.connection.getRepository(adminCtx, Rider).find({
      where: { status: 'pending' }
    });

    for (const rider of riders) {
      if (rider.avatarId) {
        const riderAvatar = await this.assetService.findOne(
          ctx,
          rider.avatarId
        );
        if (riderAvatar) {
          rider.avatar = riderAvatar;
        }
      }

      if (rider.nationalIdCardId) {
        const nationalIdCard = await this.assetService.findOne(
          ctx,
          rider.nationalIdCardId
        );
        if (nationalIdCard) {
          rider.nationalIdCard = nationalIdCard;
        }
      }

      if (rider.vehicleRegistrationFileId) {
        const vehicleRegistrationFile = await this.assetService.findOne(
          ctx,
          rider.vehicleRegistrationFileId
        );
        if (vehicleRegistrationFile) {
          rider.vehicleRegistrationFile = vehicleRegistrationFile;
        }
      }
    }
    return riders;
  }

  /**
   * Fetches a list of pending sellers from the database.
   *
   * @param {RequestContext} ctx - The request context.
   * @return {Promise<CustomSeller[]>} A promise that resolves to an array of CustomSeller objects representing the pending sellers.
   */
  async fetchOnlineRiders(ctx: RequestContext): Promise<Rider[]> {
    try {
      const riders = await this.connection.getRepository(ctx, Rider).find({
        where: { online: true },
        relations: ['riderAvatar']
      });

      return riders;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to fetch online riders');
    }
  }

  /**
   * Process a seller request by either approving or rejecting it.
   *
   * @param {RequestContext} ctx - the request context
   * @param {string} id - the ID of the seller request
   * @param {'approve' | 'reject'} decision - the decision to approve or reject the seller request
   * @return {Promise<string>} a string indicating the success of the operation
   */

  async processRiderRequest(
    ctx: RequestContext,
    id: string,
    decision: 'approve' | 'reject'
  ) {
    const adminCtx = await this.requestContextService.create({
      apiType: 'admin'
    });

    const rider = await this.connection.getRepository(adminCtx, Rider).findOne({
      where: { id: Number(id) }
    });

    if (!rider) {
      throw new NotFoundException(`Rider with ID ${id} not found`);
    }

    let message: string;

    if (decision === 'approve') {
      rider.status = 'approved';
      const message =
      `Congratulations! Your account has been approved and you are now part of our platform.\n\n` +
      `You can now login using your registered credentials.\n\n` +
      `If you have any questions or need assistance, please feel free to contact our support team.\n\n` +
      `Welcome aboard and we look forward to working with you!\n\n` +
      `Best regards,\n` +
      `The SpePas Team`;
    
      await this.smsService.sendSms(rider.phone, message);
    } else if (decision === 'reject') {
      rider.status = 'rejected';
      message =
        'Unfortunately, your rider account request has been rejected. Please contact support for further information.';
      await this.smsService.sendSms(rider.phone, message);
    } else {
      throw new BadRequestException(
        'Invalid decision. Decision must be either "approve" or "reject".'
      );
    }

    await this.connection.getRepository(adminCtx, Rider).save(rider);
    
    return {
      success: true,
      message: 'success'
    };
  }

  /**
   * Fetches a rider from the database based on the provided request context and headers.
   *
   * @param {RequestContext} ctx - The request context.
   * @param {Record<string, string | string[]>} headers - The headers containing the token for authentication.
   * @return {Promise<Rider>} A promise that resolves to the fetched rider.
   * @throws {NotFoundException} If no rider is found with the provided ID.
   * @throws {Error} If there is an error while fetching the rider.
   */
  async fetchRider(
    ctx: RequestContext,
    headers: Record<string, string | string[]>
  ): Promise<Rider> {
    try {
      const decodedToken = this.authMiddleware.verifyToken(headers);
      const id = decodedToken.id;

      const rider = await this.connection.getRepository(ctx, Rider).findOne({
        where: { userId: id },
        relations: [
          'riderAvatar',
          'vehicleRegistrationFile',
          'nationalIdCard',
          'wallet',
          'transactions',
          'requests'
        ]
      });

      // If no user is found with that
      if (!rider) {
        throw new NotFoundException('Rider  not found');
      }

      return rider;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to fetch rider');
    }
  }

  /**
   * Sets the online status of a rider in the database.
   *
   * @param {RequestContext} ctx - The request context.
   * @param {boolean} online - The new online status of the rider.
   * @param {Record<string, string | string[]>} headers - The headers containing the token for authentication.
   * @return {Promise<boolean>} A promise that resolves to true if the rider's online status was successfully updated.
   * @throws {NotFoundException} If no rider is found with the provided ID.
   */
  
  async setRiderOnline(
    ctx: RequestContext,
    headers: Record<string, string | string[]>
  ): Promise<boolean> {
    try {
      const decodedToken = this.authMiddleware.verifyToken(headers);
      const riderId = decodedToken.id;

      const riderRepository = this.connection.getRepository(ctx, Rider);
      const rider = await riderRepository.findOne({ where: { userId: riderId } });

      if (!rider) {
        throw new NotFoundException(`Rider with ID ${riderId} not found`);
      }

      const newOnlineStatus = !rider.online;
      await riderRepository.update(rider.id, { online: newOnlineStatus });

      return newOnlineStatus;
    } catch (error) {
      console.error(`Failed to toggle rider online status: ${error}`);
      throw error;
    }
  }


}
