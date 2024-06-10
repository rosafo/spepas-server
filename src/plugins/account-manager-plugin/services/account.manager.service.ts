import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import {
  RequestContext,
  TransactionalConnection,
  isGraphQlErrorResult,
  AssetService,
  ID
} from '@vendure/core';

import { CustomUser } from '../entities/user.entity';
import { CustomCustomer } from '../../customer-plugin/entities/customer.entity';
import { UserAddress } from '../../customer-plugin/entities/address.entity';
import { Rider } from '../../rider-plugin/entities/rider.entity';
import { CustomSeller } from '../../seller-plugin/entities/seller.entity';
import { UserRole } from '../entities/role.entity';
import { SmsService } from '../communication/sms/sms.service';
import * as bcrypt from 'bcrypt';
import { createToken, createTemporalToken } from '../../../utils/token-utils';
import { AuthMiddleware } from '../../../middlewares/auth.middleware';
import {
  CompleteAccountCreationInput,
  SellerInput,
  RiderInput,
  CustomerInput
} from '../dto/user-input.dto';

type OtpStoreEntry = {
  identifier: string;
  otp: string;
};

const otpStore: Record<string, OtpStoreEntry> = {};

@Injectable()
export class UserService {
  constructor(
    private connection: TransactionalConnection,
    private smsService: SmsService,
    private assetService: AssetService,
    private readonly authMiddleware: AuthMiddleware
  ) {}

  async initiateAccountCreation(
    ctx: RequestContext,
    input: { phone: string; password: string }
  ): Promise<{ success: boolean; message?: string }> {
    try {
      if (!input.phone || !input.password) {
        throw new BadRequestException('Phone and password are required');
      }

      const userRepository = this.connection.getRepository(ctx, CustomUser);
      const existingUser = await userRepository.findOne({
        where: { phone: input.phone }
      });

      if (existingUser) {
        throw new ConflictException(
          'User with this phone number already exists'
        );
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const newUser = userRepository.create({
        phone: input.phone,
        password: hashedPassword
      });

      await userRepository.save(newUser);
      const generatedOtp = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      otpStore[input.phone] = {
        identifier: input.phone,
        otp: generatedOtp
      };

      await this.smsService.sendOtpSms(input.phone, generatedOtp);
      return {
        success: true,
        message: `OTP sent successfully : ${generatedOtp}`
      };
    } catch (error) {
      console.error('Failed to initiate account creation OTP:', error);
      return {
        success: false,
        message: `${error}`
      };
    }
  }

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

    const userRepository = this.connection.getRepository(ctx, CustomUser);
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
    const userId: string = user.id.toString();
    const token = createTemporalToken(userId);

    return { token };
  }

  async createAccount(
    ctx: RequestContext,
    input: CompleteAccountCreationInput,
    headers: Record<string, string | string[]>
  ): Promise<any> {
    const decodedToken = this.authMiddleware.verifyToken(headers);
    const userId = decodedToken.id;

    const userRepository = this.connection.getRepository(ctx, CustomUser);
    const user = await userRepository.findOne({
      where: { id: Number(userId) }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let response;

    switch (input.role) {
      case UserRole.CUSTOMER:
        if (input.customer) {
          response = await this.completeCustomerAccountCreation(
            ctx,
            user,
            input.customer
          );
        }
        break;

      case UserRole.RIDER:
        if (input.rider) {
          response = await this.completeRiderAccountCreation(
            ctx,
            user,
            input.rider
          );
        }
        break;

      case UserRole.SELLER:
        if (input.seller) {
          response = await this.completeSellerAccountCreation(
            ctx,
            user,
            input.seller
          );
        }
        break;

      default:
        response = {
          success: false,
          message: 'Operation failed',
          authResult: {}
        };
        throw new Error('Invalid role');
    }

    return response;
  }

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
        message: `OTP resent successfully ,${generatedOtp}`
      };
    } catch (error) {
      console.error('Failed to resend OTP:', error);
      return {
        success: false,
        message: `${error}`
      };
    }
  }

  async customLogin(
    ctx: RequestContext,
    input: { identifier: string; password: string }
  ): Promise<{ token: string; user: CustomUser }> {
    const userRepository = this.connection.getRepository(ctx, CustomUser);
    const riderRepository = this.connection.getRepository(ctx, Rider);
    const sellerRepository = this.connection.getRepository(ctx, CustomSeller);

    const user = await userRepository.findOne({
      where: [{ phone: input.identifier }]
    });

    if (!user) {
      throw new NotFoundException(
        `User with identifier ${input.identifier} not found`
      );
    }

    // Check if user is a rider and their status
    if (user.roles.includes(UserRole.RIDER)) {
      const rider = await riderRepository.findOne({
        where: { userId: user.id.toString() }
      });

      if (rider && rider.status !== 'approved') {
        throw new BadRequestException(
          'Rider account not approved yet. Please contact support for further information.'
        );
      }
    }

    // Check if user is a seller and their status
    if (user.roles.includes(UserRole.SELLER)) {
      const seller = await sellerRepository.findOne({
        where: { userId: user.id.toString() }
      });

      if (seller && seller.status !== 'approved') {
        throw new BadRequestException(
          'Seller account not approved yet. Please contact support for further information.'
        );
      }
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    // Ensure roles are fetched and not empty
    if (!user.roles || user.roles.length === 0) {
      throw new Error('User roles are not defined');
    }

    if (user && user.avatarId) {
      const avatar = await this.assetService.findOne(ctx, user.avatarId);
      if (avatar) {
        user.avatar = avatar;
      }
    }

    const userId: string = user.id.toString();
    const token = createToken(userId);

    return { token, user };
  }

  async findUserById(
    ctx: RequestContext,
    headers: Record<string, string | string[]>
  ): Promise<CustomUser | null> {
    try {
      const decodedToken = this.authMiddleware.verifyToken(headers);
      if (!decodedToken || !decodedToken.id) {
        return null;
      }

      const userId = decodedToken.id;
      const userRepository = this.connection.getRepository(ctx, CustomUser);
      const user = await userRepository.findOne({
        where: { id: Number(userId) }
      });

      if (user && user.avatarId) {
        const avatar = await this.assetService.findOne(ctx, user.avatarId);
        if (avatar) {
          user.avatar = avatar;
        }
      }

      return user;
    } catch (error) {
      console.error('Error finding customer by ID:', error);
      return null;
    }
  }

  async switchAccount(
    ctx: RequestContext,
    newRole: UserRole,
    headers: Record<string, string | string[]>
  ): Promise<{ token: string; user: CustomUser }> {
    const decodedToken = this.authMiddleware.verifyToken(headers);
    const userId = decodedToken.id;

    const userRepository = this.connection.getRepository(ctx, CustomUser);
    const user = await userRepository.findOne({
      where: { id: Number(userId) }
    });

    if (!user) {
      throw new NotFoundException(`User with identifier ${userId} not found`);
    }

    if (!user.roles.includes(newRole)) {
      user.roles = [newRole];
      await userRepository.save(user);
    }

    // Fetch the avatar if available
    if (user.avatarId) {
      const avatar = await this.assetService.findOne(ctx, user.avatarId);
      if (avatar) {
        user.avatar = avatar; 
      }
    }

    // Generate token with the updated user information
    const token = createToken(user.id.toString());
    return { token, user };
  }

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
      message: `OTP resent successfully : ${generatedOtp}`
    };
  }

  async resetUserPassword(
    ctx: RequestContext,
    input: { newPassword: string },
    headers: Record<string, string | string[]>
  ): Promise<{ success: boolean; message?: string }> {
    const decodedToken = this.authMiddleware.verifyToken(headers);
    const userId = decodedToken.id;

    const userRepository = this.connection.getRepository(ctx, CustomUser);
    const user = await userRepository.findOne({
      where: { id: Number(userId) }
    });

    if (!user) {
      throw new NotFoundException(`User with identifier ${userId} not found`);
    }
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(input.newPassword, saltRounds);
    user.password = hashedPassword;
    await userRepository.update({ id: Number(userId) }, user);
    return {
      success: true,
      message: 'Password reset successfully'
    };
  }

  async uploadProfilePicture(
    ctx: RequestContext,
    file: any,
    headers: Record<string, string | string[]>
  ): Promise<any> {
    const decodedToken = this.authMiddleware.verifyToken(headers);
    const userId = decodedToken.id;

    const userRepository = this.connection.getRepository(ctx, CustomUser);
    const user = await userRepository.findOne({
      where: { id: Number(userId) }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Create an Asset from the uploaded file
    const asset = await this.assetService.create(ctx, {
      file,
      tags: ['avatar']
    });

    if (isGraphQlErrorResult(asset)) {
      throw asset;
    }

    await userRepository.update(
      { id: Number(userId) },
      { avatarId: Number(asset.id) }
    );

    return asset;
  }

  async changePassword(
    ctx: RequestContext,
    input: { oldPassword: string; newPassword: string },
    headers: Record<string, string | string[]>
  ): Promise<any> {
    const decodedToken = this.authMiddleware.verifyToken(headers);
    const userId = decodedToken.id;

    const userRepository = this.connection.getRepository(ctx, CustomUser);
    const user = await userRepository.findOne({
      where: { id: Number(userId) }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const isPasswordValid = await bcrypt.compare(
      input.oldPassword,
      user.password
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid old password');
    }

    const hashedPassword = await bcrypt.hash(input.newPassword, 10);
    user.password = hashedPassword;
    const updatedUser = await userRepository.save(user);

    return updatedUser;
  }

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
    const parentUserRepository = this.connection.getRepository(ctx, CustomUser);
    const parentUser = await parentUserRepository.findOne({
      where: { id: Number(userId) }
    });

    if (!parentUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!input.password) {
      throw new BadRequestException('Password is required for verification.');
    }
    if (!input.currentContact) {
      throw new BadRequestException(
        'Please provide the current contact information.'
      );
    }

    const user = await userRepository.findOne({
      where: { userId: userId }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password. Please try again.');
    }

    if (user.phone !== input.currentContact) {
      throw new NotFoundException(
        'Current contact information does not match.'
      );
    }

    user.phone = input.newContact;
    parentUser.phone = input.newContact;
    await userRepository.save(user);
    await parentUserRepository.save(parentUser);

    return user;
  }

  private async completeCustomerAccountCreation(
    ctx: RequestContext,
    user: CustomUser,
    customerInput: CustomerInput
  ): Promise<{ success: boolean; message?: string; token: string }> {
    const customerRepository = this.connection.getRepository(
      ctx,
      CustomCustomer
    );
    const userRepository = this.connection.getRepository(ctx, CustomUser);
    const addressRepository = this.connection.getRepository(ctx, UserAddress);

    // Create and save address
    const address = new UserAddress();
    address.city = customerInput.city;
    address.street = customerInput.street;
    address.GPS = customerInput.gps;
    const savedAddress = await addressRepository.save(address);

    // Create customer and link the existing user
    const customer = new CustomCustomer();
    customer.fullName = customerInput.fullName;
    customer.roles = [UserRole.CUSTOMER];
    customer.phone = user.phone;
    customer.password = user.password;
    customer.addresses = [savedAddress];
    customer.userId = user.id.toString();

    // Handle profile picture upload
    if (customerInput.profilePicture) {
      const profilePicture = customerInput.profilePicture;
      if (profilePicture) {
        customer.avatarId = await this.handleFileUpload(
          ctx,
          this.assetService,
          profilePicture,
          ['avatar']
        );
      } else {
        console.log('profilePicture is undefined');
      }
    }

    await customerRepository.save(customer);

    // Update the user
    user.roles = [UserRole.CUSTOMER];
    user.avatarId = customer.avatarId;
    user.fullName = customer.fullName;
    await userRepository.save(user);

    const token = createToken(customer.userId);
    return {
      success: true,
      message: 'account created successfully',
      token
    };
  }

  private async completeRiderAccountCreation(
    ctx: RequestContext,
    user: CustomUser,
    riderInput: RiderInput
  ): Promise<{ success: boolean; message?: string }> {
    const userRepository = this.connection.getRepository(ctx, CustomUser);
    const riderRepository = this.connection.getRepository(ctx, Rider);
    const rider = new Rider();

    rider.fullName = riderInput.fullName;
    rider.phone = riderInput.phone;
    rider.vehicleType = riderInput.vehicleType;
    rider.roles = [UserRole.RIDER];
    rider.userId = user.id.toString();
    rider.password = user.password;

    // Handle profile picture upload
    if (riderInput.profilePicture) {
      const profilePicture = riderInput.profilePicture;
      if (profilePicture) {
        const avatarId = await this.handleFileUpload(
          ctx,
          this.assetService,
          profilePicture,
          ['avatar']
        );
        rider.avatarId = avatarId;
        user.avatarId = avatarId;
      } else {
        console.log('profilePicture is undefined');
      }
    }

    // Handle vehicle registration file upload
    if (riderInput.vehicleRegistrationFile) {
      const vehicleRegistrationFile = riderInput.vehicleRegistrationFile;
      if (vehicleRegistrationFile) {
        rider.vehicleRegistrationFileId = await this.handleFileUpload(
          ctx,
          this.assetService,
          vehicleRegistrationFile,
          ['vehicleRegistrationFile']
        );
      } else {
        console.log('vehicleRegistrationFile is undefined');
      }
    }

    // Handle national ID card upload
    if (riderInput.nationalIdCard) {
      const nationalIdCard = riderInput.nationalIdCard;
      if (nationalIdCard) {
        rider.nationalIdCardId = await this.handleFileUpload(
          ctx,
          this.assetService,
          nationalIdCard,
          ['nationalIdCard']
        );
      } else {
        console.log('nationalIdCard is undefined');
      }
    }

    await riderRepository.save(rider);

    user.roles = [UserRole.RIDER];
    user.fullName = riderInput.fullName;
    await userRepository.save(user);

    const message =
      'Your details have been successfully submitted. We will review them and get back to you as soon as possible. Thank you!';
    await this.smsService.sendOtpSms(rider.phone, message);
    return {
      success: true,
      message: 'submitted successfully'
    };
  }

  private async completeSellerAccountCreation(
    ctx: RequestContext,
    user: CustomUser,
    sellerInput: SellerInput
  ): Promise<{ success: boolean; message?: string }> {
    const userRepository = this.connection.getRepository(ctx, CustomUser);
    const sellerRepository = this.connection.getRepository(ctx, CustomSeller);
    const seller = new CustomSeller();

    seller.shopName = sellerInput.shopName;
    seller.fullName = sellerInput.seller.fullName;
    seller.email = sellerInput.seller.emailAddress;
    seller.phone = sellerInput.seller.phone;
    seller.TIN = sellerInput.seller.TIN;
    seller.shopAddress = sellerInput.seller.shopAddress;
    seller.aboutShop = sellerInput.seller.aboutShop;
    seller.roles = [UserRole.SELLER];
    seller.userId = user.id.toString();

    // Handle profile picture upload
    if (sellerInput.seller.profilePicture) {
      const profilePicture = sellerInput.seller.profilePicture;
      if (profilePicture) {
        const avatarId = await this.handleFileUpload(
          ctx,
          this.assetService,
          profilePicture,
          ['avatar']
        );
        seller.avatarId = avatarId;
        user.avatarId = avatarId;
      } else {
        console.log('profilePicture is undefined');
      }
    }

    if (sellerInput.seller.businessRegistrationFile) {
      const businessRegistrationFile = sellerInput.seller.profilePicture;
      if (businessRegistrationFile) {
        seller.businessRegistrationFileId = await this.handleFileUpload(
          ctx,
          this.assetService,
          businessRegistrationFile,
          ['businessRegistrationFile']
        );
      } else {
        console.log('profilePicture is undefined');
      }
    }

    await sellerRepository.save(seller);
    user.roles = [UserRole.SELLER];
    user.fullName = sellerInput.seller.fullName;
    await userRepository.save(user);
    const message =
      'Your details have been successfully submitted. We will review them and get back to you as soon as possible. Thank you!';
    await this.smsService.sendOtpSms(seller.phone, message);
    return {
      success: true,
      message: 'submitted successfully'
    };
  }

  private async handleFileUpload(
    ctx: RequestContext,
    assetService: AssetService,
    file: any,
    tags: string[]
  ): Promise<number> {
    const assetResult = await assetService.create(ctx, {
      file,
      tags
    });

    if (isGraphQlErrorResult(assetResult)) {
      throw assetResult;
    }

    return Number(assetResult.id);
  }

  private async fetchCustomerData(
    ctx: RequestContext,
    userId: string
  ): Promise<CustomCustomer> {
    const customerRepository = this.connection.getRepository(
      ctx,
      CustomCustomer
    );

    const customer = await customerRepository.findOne({
      where: { userId: userId },
      relations: ['addresses', 'avatar']
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (customer && customer.avatarId) {
      const avatar = await this.assetService.findOne(ctx, customer.avatarId);
      if (avatar) {
        customer.avatar = avatar;
      }
    }

    return customer;
  }

  private async fetchRiderData(
    ctx: RequestContext,
    userId: string
  ): Promise<Rider> {
    const riderRepository = this.connection.getRepository(ctx, Rider);
    const rider = await riderRepository.findOne({
      where: { userId: userId }
    });

    if (!rider) {
      throw new NotFoundException('Rider not found');
    }
    // Check if the rider's status is approved
    if (rider.status !== 'approved') {
      throw new BadRequestException(
        'Rider account not approved yet. Please contact support for further information.'
      );
    }

    if (rider && rider.avatarId) {
      const avatar = await this.assetService.findOne(ctx, rider.avatarId);
      if (avatar) {
        rider.avatar = avatar;
      }
    }

    return rider;
  }

  private async fetchSellerData(
    ctx: RequestContext,
    userId: string
  ): Promise<CustomSeller> {
    const sellerRepository = this.connection.getRepository(ctx, CustomSeller);
    const seller = await sellerRepository.findOne({
      where: { userId: userId }
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }
    // Check if the rider's status is approved
    if (seller.status !== 'approved') {
      throw new BadRequestException(
        'seller account not approved yet. Please contact support for further information.'
      );
    }

    if (seller && seller.avatarId) {
      const avatar = await this.assetService.findOne(ctx, seller.avatarId);
      if (avatar) {
        seller.avatar = avatar;
      }
    }

    return seller;
  }
}
