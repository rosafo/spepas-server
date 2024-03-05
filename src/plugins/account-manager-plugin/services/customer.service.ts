import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import {
  ID,
  RequestContext,
  TransactionalConnection,
  UserInputError,
  Logger
} from '@vendure/core';
import {
  BlobServiceClient,
  StorageSharedKeyCredential
} from '@azure/storage-blob';
import { CustomCustomer } from '../entities/customer.entity';
import { SmsService } from '../communication/sms/sms.service';
import { EmailService } from '../communication/email/email.service';
import * as bcrypt from 'bcrypt';
import { createToken, createTemporalToken } from '../../utils/token-utils';
import { AuthMiddleware } from '../../utils/auth.middleware';
import { Asset } from '../entities/asset.entity';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
type OtpStoreEntry = {
  identifier: string;
  otp: string;
};

const otpStore: Record<string, OtpStoreEntry> = {};

@Injectable()
export class CustomerService {
  constructor(
    private connection: TransactionalConnection,
    private smsService: SmsService,
    private emailService: EmailService,
    private readonly authMiddleware: AuthMiddleware
  ) {}

  /**
   * Initiate the account creation process by sending an OTP to the user's phone.
   *
   * @param {RequestContext} ctx - the request context
   * @param {Input} input - the user's phone number and password
   * @return {Promise<OtpResult>} the result of OTP initiation
   */
  async initiateAccountCreation(
    ctx: RequestContext,
    input: { phone: string; password: string }
  ): Promise<{ success: boolean; message?: string }> {
    const sender = 'mNotify';
    const purpose = ['sending otp'];

    try {
      if (!input.phone || !input.password) {
        throw new BadRequestException('Phone and password are required');
      }
      // Check if the phone number already exists in the database
      const userRepository = this.connection.getRepository(ctx, CustomCustomer);
      const existingUser = await userRepository.findOne({
        where: { phone: input.phone }
      });

      if (existingUser) {
        throw new ConflictException(
          'User with this phone number already exists'
        );
      }

      // Store the hashed password and phone number in the database
      const newUser = userRepository.create({
        phone: input.phone,
        password: input.password
      });

      await userRepository.save(newUser);
      const generatedOtp = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      // Store the OTP in memory with the phone number
      otpStore[input.phone] = {
        identifier: input.phone,
        otp: generatedOtp
      };

      // Send the OTP via SMS
      await this.smsService.sendOtpSms(input.phone, generatedOtp);
      return {
        success: true,
        message: 'OTP sent successfully'
      };
    } catch (error) {
      console.error('Failed to initiate account creation OTP:', error);
      return {
        success: false,
        message: `${error}`
      };
    }
  }

  /**
   * Resends the OTP to the user's phone.
   *
   * @param {RequestContext} ctx - the request context
   * @param {string} phone - the user's phone number
   * @return {Promise<{ success: boolean; message?: string }>} - the result of OTP resend
   */
  async resendOtp(
    ctx: RequestContext,
    input: { phone: string }
  ): Promise<{ success: boolean; message?: string }> {
    try {
      console.log(input.phone);
      // Generate a new OTP
      const generatedOtp = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      // Update the OTP in the store or create a new entry if not exists
      otpStore[input.phone] = {
        identifier: input.phone,
        otp: generatedOtp
      };

      // Send the new OTP via SMS
      await this.smsService.sendOtpSms(input.phone, generatedOtp);

      return {
        success: true,
        message: 'OTP resent successfully'
      };
    } catch (error) {
      console.error('Failed to resend OTP:', error);
      return {
        success: false,
        message: `${error}`
      };
    }
  }

  /**
   * Verify the provided OTP for password recovery.
   *
   * @param {RequestContext} ctx - the request context
   * @param {string} otp - the one-time password provided by the user
   * @param {string} phoneNumber - the phone number associated with the OTP
   * @return {Promise<{ token: string }>} the token if OTP is valid
   */
  async verifyOtp(
    ctx: RequestContext,
    input: { otp: string }
  ): Promise<{ token: string }> {
    const storedOtpEntryKey = Object.keys(otpStore).find((key) => {
      otpStore[key].otp === input.otp;
      return key;
    });

    if (
      !storedOtpEntryKey ||
      typeof otpStore[storedOtpEntryKey].otp !== 'string' ||
      input.otp !== otpStore[storedOtpEntryKey].otp
    ) {
      throw new BadRequestException('Invalid OTP');
    }

    const storedOtpEntry = otpStore[storedOtpEntryKey];

    // Get the customer associated with the OTP
    const userRepository = this.connection.getRepository(ctx, CustomCustomer);
    const user = await userRepository.findOne({
      where: [
        { email: storedOtpEntry.identifier },
        { phone: storedOtpEntry.identifier }
      ]
    });

    if (!user) {
      throw new NotFoundException(`User with OTP ${input.otp} not found`);
    }

    delete otpStore[storedOtpEntryKey];
    // Generate and return a token
    const userId: string = user.id.toString();
    const token = createTemporalToken(userId);

    return { token };
  }

  /**
   * A function to complete the account creation process.
   *
   * @param {RequestContext} ctx - the request context
   * @param {object} input - the input object containing userId, fullName, city, street, and gps
   * @return {Promise<{ token: string }>} a promise that resolves with the token string
   */
  async completeAccountCreation(
    ctx: RequestContext,
    input: {
      fullName: string;
      city: string;
      street: string;
      gps: string;
      profilePicture?: { file: any };
    },
    headers: Record<string, string | string[]>
  ): Promise<{ token: string; user: CustomCustomer }> {
    // Verify the token
    const decodedToken = this.authMiddleware.verifyToken(headers);
    const userId = decodedToken.id;

    const userRepository = this.connection.getRepository(ctx, CustomCustomer);
    const user = await userRepository.findOne({
      where: { id: Number(userId) }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.fullName = input.fullName;
    user.addressCity = input.city;
    user.addressStreet = input.street;
    user.addressGPS = input.gps;

    // If profile picture is provided, upload it
    if (input.profilePicture) {
      await this.uploadProfilePicture(ctx, user, input.profilePicture.file);
    }
    // Save the updated user and generate a token
    await userRepository.save(user);
    const token = createToken(userId);
    return { token, user };
  }

  /**
   * Uploads a profile picture for a user.
   *
   * @param {RequestContext} ctx - the request context
   * @param {{ userId: string; file: any }} input - the user ID and the file to be uploaded
   * @return {Promise<CustomCustomer>} the updated user with the uploaded profile picture
   */

  async uploadProfilePicture(
    ctx: RequestContext,
    file: any,
    headers: Record<string, string | string[]>
  ): Promise<CustomCustomer> {
    const decodedToken = this.authMiddleware.verifyToken(headers);
    const userId = decodedToken.id;

    const userRepository = this.connection.getRepository(ctx, CustomCustomer);
    const user = await userRepository.findOne({
      where: { id: Number(userId) }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const uploadedFile = file;
    const fileExtension = path.extname(uploadedFile.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;

    // Set up Azure Storage credentials
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;    
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName??"", accountKey?? "");
    
    // Set up BlobServiceClient
    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      sharedKeyCredential
    );

    // Set up container client
    const containerName = process.env.AZURE_BLOB_CONTAINER_NAME;
    const containerClient = blobServiceClient.getContainerClient(containerName??"profile-pictures");

    // Set up blob client
    const blobClient = containerClient.getBlockBlobClient(fileName);

    try {
      // Upload file to Azure Storage
      await blobClient.uploadData(uploadedFile.buffer, {
        blobHTTPHeaders: { blobContentType: uploadedFile.mimetype }
      });

      const newAsset = new Asset();
      newAsset.name = fileName;
      newAsset.type = 'image';
      newAsset.size = uploadedFile.size;
      newAsset.url = blobClient.url; 
      // Save the new Asset to get its ID
      const savedAsset = await newAsset.save();
      user.avatarId = savedAsset.id;
      await userRepository.save(user);

      return user;
    } catch (error) {
      throw new UserInputError(
        `Failed to upload profile picture file: ${error}`
      );
    }
  }

  /**
   * Performs custom login for the user.
   *
   * @param {RequestContext} ctx - the request context
   * @param {{ identifier: string; password: string }} input - object containing user identifier and password
   * @return {Promise<{ token: string; user: CustomCustomer }>} returns a promise with token and user information
   */
  async customLogin(
    ctx: RequestContext,
    input: { identifier: string; password: string }
  ): Promise<{ token: string; user: CustomCustomer }> {
    const userRepository = this.connection.getRepository(ctx, CustomCustomer);
    const user = await userRepository.findOne({
      where: [{ email: input.identifier }, { phone: input.identifier }]
    });

    if (!user) {
      throw new NotFoundException(
        `User with identifier ${input.identifier} not found`
      );
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    // Generate and return a token
    const userId: string = user.id.toString();
    const token = createToken(userId);

    return { token, user };
  }

  /**
   * Function to asynchronously change the password for a user.
   *
   * @param {RequestContext} ctx - the request context
   * @param {ID} userId - the ID of the user
   * @param {string} oldPassword - the old password
   * @param {string} newPassword - the new password
   * @return {Promise<CustomCustomer>} the updated user with the new password
   */
  async changePassword(
    ctx: RequestContext,
    oldPassword: string,
    newPassword: string,
    headers: Record<string, string | string[]>
  ): Promise<CustomCustomer> {
    const decodedToken = this.authMiddleware.verifyToken(headers);
    const userId = decodedToken.id;

    const userRepository = this.connection.getRepository(ctx, CustomCustomer);
    const user = await userRepository.findOne({
      where: { id: Number(userId) }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid old password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    const updatedUser = await userRepository.save(user);

    return updatedUser;
  }

  /**
   * Change contact information for a user and save the updated user information.
   *
   * @param {RequestContext} ctx - the request context
   * @param {Object} input - object containing currentContact, newContact, and password
   * @param {Record<string, string | string[]>} headers - request headers
   * @return {Promise<CustomCustomer>} the updated user information
   */
  async changeContact(
    ctx: RequestContext,
    input: {
      currentContact: string;
      newContact: string;
      password: string;
    },
    headers: Record<string, string | string[]>
  ): Promise<CustomCustomer> {
    const decodedToken = this.authMiddleware.verifyToken(headers);
    const userId = decodedToken.id;

    const userRepository = this.connection.getRepository(ctx, CustomCustomer);
    const user = await userRepository.findOne({
      where: { id: Number(userId) }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    if (!user.password) {
      throw new BadRequestException('User password is not set.');
    }

    // Ensure password is provided
    if (!input.password) {
      throw new BadRequestException('Password is required for verification.');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);

    console.log(isPasswordValid);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password. Please try again.');
    }

    if (!input.currentContact) {
      throw new BadRequestException(
        'Please provide the current contact information.'
      );
    }

    if (user.phone !== input.currentContact) {
      throw new NotFoundException(
        'Current contact information does not match.'
      );
    }

    user.phone = input.newContact;
    await userRepository.save(user);

    return user;
  }

  async manageAddress(
    ctx: RequestContext,
    title: string,
    city: string,
    street: string,
    gps: string,
    headers: Record<string, string | string[]>
  ): Promise<CustomCustomer> {
    // Verify the token
    const decodedToken = this.authMiddleware.verifyToken(headers);
    const userId = decodedToken.id;

    const userRepository = this.connection.getRepository(ctx, CustomCustomer);
    const user = await userRepository.findOne({
      where: { id: Number(userId) }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update the address fields
    user.addressTitle = title;
    user.addressCity = city;
    user.addressStreet = street;
    user.addressGPS = gps;

    // Save the updated user and generate a token
    const updatedUser = await userRepository.save(user);
    return updatedUser;
  }

  /**
   * Initiates a password reset process by generating an OTP and sending it via SMS.
   *
   * @param {RequestContext} ctx - the request context
   * @param {{ identifier: string }} input - the identifier for the password reset
   * @return {Promise<{ success: boolean; message?: string }>} an object indicating the success status and an optional message
   */
  async initiatePasswordReset(
    ctx: RequestContext,
    input: { identifier: string }
  ): Promise<{ success: boolean; message?: string }> {
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[input.identifier] = {
      identifier: input.identifier,
      otp: generatedOtp
    };

    await this.smsService.sendOtpSms(input.identifier, generatedOtp);
    return {
      success: true,
      message: 'OTP sent successfully'
    };
  }

  /**
   * Reset the user's password.
   *
   * @param {RequestContext} ctx - the request context
   * @param {object} input - the user identifier and new password
   * @return {Promise<CustomCustomer>} the updated user after password reset
   */
  async resetUserPassword(
    ctx: RequestContext,
    newPassword: string,
    headers: Record<string, string | string[]>
  ): Promise<{ success: boolean; message?: string }> {
    const decodedToken = this.authMiddleware.verifyToken(headers);
    const userId = decodedToken.id;

    const userRepository = this.connection.getRepository(ctx, CustomCustomer);
    const user = await userRepository.findOne({
      where: { id: Number(userId) }
    });

    if (!user) {
      throw new NotFoundException(`User with identifier ${userId} not found`);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
     await userRepository.save(user);
    return {
      success: true,
      message: 'Password reset successfully'
    };
  }
}
