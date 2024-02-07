import { Injectable } from '@nestjs/common';
import {
  ID,
  RequestContext,
  TransactionalConnection,
  UserInputError,
  Logger
} from '@vendure/core';
import { CustomCustomer } from '../entities/customer.entity';
import { SmsService } from '../communication/sms/sms.service';
import { EmailService } from '../communication/email/email.service';
import * as bcrypt from 'bcrypt';
import { createToken, createTemporalToken } from '../../utils/token-utils';
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
    private emailService: EmailService
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
    try {
      // Validate input
      if (!input.phone || !input.password) {
        throw new UserInputError('Phone and password are required');
      }
      // Check if the phone number already exists in the database
      const userRepository = this.connection.getRepository(ctx, CustomCustomer);
      const existingUser = await userRepository.findOne({
        where: { phone: input.phone }
      });

      if (existingUser) {
        throw new UserInputError('User with this phone number already exists');
      }
      // Store the hashed password and phone number in the database
      const newUser = userRepository.create({
        phone: input.phone,
        password: input.password
      });

      await userRepository.save(newUser);
      // Generate a random OTP
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
   * Verify the provided OTP for password recovery.
   *
   * @param {RequestContext} ctx - the request context
   * @param {string} otp - the one-time password provided by the user
   * @return {Promise<CustomCustomer>} the user object if OTP is valid
   */
  async verifyOtp(
    ctx: RequestContext,
    input: { otp: string }
  ): Promise<{ token: string }> {
    const storedOtpEntry = Object.values(otpStore).find(
      (entry) => entry.otp === input.otp
    );

    if (
      !storedOtpEntry ||
      typeof storedOtpEntry.otp !== 'string' ||
      input.otp !== storedOtpEntry.otp
    ) {
      throw new UserInputError('Invalid OTP');
    }
    // Get the customer associated with the OTP
    const userRepository = this.connection.getRepository(ctx, CustomCustomer);
    const user = await userRepository.findOne({
      where: [
        { email: storedOtpEntry.identifier },
        { phone: storedOtpEntry.identifier }
      ]
    });

    if (!user) {
      throw new UserInputError(`User with OTP ${input.otp} not found`);
    }
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
      userId: string;
      fullName: string;
      city: string;
      street: string;
      gps: string;
      profilePicture?: { file: any };
    }
  ): Promise<{ token: string }> {
    const userRepository = this.connection.getRepository(ctx, CustomCustomer);
    const user = await userRepository.findOne({
      where: { id: Number(input.userId) }
    });

    if (!user) {
      throw new UserInputError('User not found');
    }

    user.fullName = input.fullName;
    user.city = input.city;
    user.street = input.street;
    user.gps = input.gps;

    // If profile picture is provided, upload it
    if (input.profilePicture) {
      await this.uploadProfilePicture(ctx, {
        userId: input.userId,
        file: input.profilePicture.file
      });
    }
    // Save the updated user and generate a token
    await userRepository.save(user);
    const token = createToken(input.userId);
    return { token };
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
    input: { userId: string; file: any }
  ): Promise<CustomCustomer> {
    const userRepository = this.connection.getRepository(ctx, CustomCustomer);
    const user = await userRepository.findOne({
      where: { id: Number(input.userId) }
    });

    if (!user) {
      throw new UserInputError('User not found');
    }

    if (!input.file) {
      throw new UserInputError('No file uploaded');
    }

    const uploadedFile = input.file;
    const fileExtension = path.extname(uploadedFile.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const uploadFolderPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'static',
      'assets',
      'upload'
    );
    const filePath = path.join(uploadFolderPath, fileName);

    try {
      // Asynchronous file write operation
      await fs.promises.writeFile(filePath, uploadedFile.buffer);

    const newAsset = new Asset();
    newAsset.name = fileName;
    newAsset.type = 'image';
    newAsset.size = uploadedFile.size;
    newAsset.url = filePath;

    // Save the new Asset to get its ID
    const savedAsset = await newAsset.save();

    // Assign the ID of the new Asset to user.avatarId
    user.avatarId = savedAsset.id;

      // Save the user with the updated avatar
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
      throw new UserInputError(
        `User with identifier ${input.identifier} not found`
      );
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new UserInputError('Invalid password');
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
    userId: ID,
    oldPassword: string,
    newPassword: string
  ): Promise<CustomCustomer> {
    const userRepository = this.connection.getRepository(ctx, CustomCustomer);
    const user = await userRepository.findOne({
      where: { id: Number(userId) }
    });

    if (!user) {
      throw new UserInputError(`User with ID ${userId} not found`);
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      throw new UserInputError('Invalid old password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
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
    input: {
      userId: string;
      newPassword: string;
    }
  ): Promise<CustomCustomer> {
    const userRepository = this.connection.getRepository(ctx, CustomCustomer);
    const user = await userRepository.findOne({
      where: { id: Number(input.userId) }
    });

    if (!user) {
      throw new UserInputError(
        `User with identifier ${input.userId} not found`
      );
    }

    const hashedPassword = await bcrypt.hash(input.newPassword, 10);
    user.password = hashedPassword;
    const updatedUser = await userRepository.save(user);
    return updatedUser;
  }
}
