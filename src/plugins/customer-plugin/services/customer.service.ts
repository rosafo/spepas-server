import { Injectable, NotFoundException } from '@nestjs/common';
import {
  RequestContext,
  TransactionalConnection,
  AssetService
} from '@vendure/core';
import { CustomCustomer } from '../entities/customer.entity';
import { AuthMiddleware } from '../../../middlewares/auth.middleware';
import { UserAddress } from '../entities/address.entity';
import { EditAddressInput, DeleteAddressInput } from '../api/customer.resolver';

type OtpStoreEntry = {
  identifier: string;
  otp: string;
};

const otpStore: Record<string, OtpStoreEntry> = {};

@Injectable()
export class CustomerService {
  constructor(
    private connection: TransactionalConnection,
    private assetService: AssetService,
    private readonly authMiddleware: AuthMiddleware
  ) {}

  /**
   * A function to find a customer by their ID.
   *
   * @param {RequestContext} ctx - the request context
   * @param {Record<string, string | string[]>} headers - the headers object
   * @return {Promise<CustomCustomer | null>} the found customer or null if not found
   */

  async findCustomerById(
    ctx: RequestContext,
    headers: Record<string, string | string[]>
  ): Promise<CustomCustomer | null> {
    try {
      const decodedToken = this.authMiddleware.verifyToken(headers);
      if (!decodedToken || !decodedToken.id) {
        console.error('Invalid or missing token');
        return null;
      }

      const userId = decodedToken.id;
      const userRepository = this.connection.getRepository(ctx, CustomCustomer);
      const customer = await userRepository.findOne({
        where: { userId: userId },
        relations: [
          'addresses',
          'reports',
          'reports.itemImage',
          'productRequests',
          'productRequests.productRequestImage'
        ]
      });

      if (customer && customer.avatarId) {
        const avatar = await this.assetService.findOne(ctx, customer.avatarId);
        if (avatar) {
          customer.avatar = avatar;
        }
      }

      return customer;
    } catch (error) {
      console.error('Error finding customer by ID:', error);
      return null;
    }
  }

  /**
   * Manage an address for a custom customer.
   *
   * @param {RequestContext} ctx - the request context
   * @param {string} title - the title of the address
   * @param {string} city - the city of the address
   * @param {string} street - the street of the address
   * @param {string} gps - the GPS coordinates of the address
   * @param {Record<string, string | string[]>} headers - the headers for authorization
   * @return {Promise<CustomCustomer>} the updated custom customer
   */
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

    // Get repositories
    const userRepository = this.connection.getRepository(ctx, CustomCustomer);
    const addressRepository = this.connection.getRepository(ctx, UserAddress);

    try {
      // Find the user
      const user = await userRepository.findOne({
        where: { userId: userId },
        relations: ['addresses']
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Create a new Address entity
      const address = new UserAddress();
      address.title = title;
      address.city = city;
      address.street = street;
      address.GPS = gps;

      const savedAddress = await addressRepository.save(address);
      user.addresses.push(savedAddress);
      await userRepository.save(user);

      return user;
    } catch (error) {
      throw error;
    }
  }

  async editAddress(
    ctx: RequestContext,
    input: EditAddressInput,
    headers: Record<string, string | string[]>
  ): Promise<CustomCustomer> {
    // Verify the token
    const decodedToken = this.authMiddleware.verifyToken(headers);
    const userId = decodedToken.id;

    // Get repositories
    const userRepository = this.connection.getRepository(ctx, CustomCustomer);
    const addressRepository = this.connection.getRepository(ctx, UserAddress);
    try {
      // Find the user
      const user = await userRepository.findOne({
        where: { userId: userId },
        relations: ['addresses']
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Find the address to update
      const addressToUpdate = user.addresses.find(
        (address) => address.id === input.id
      );
      if (!addressToUpdate) {
        throw new NotFoundException('Address not found');
      }

      // Update the address properties
      addressToUpdate.title = input.title.toString();
      addressToUpdate.city = input.city.toString();
      addressToUpdate.street = input.street.toString();
      addressToUpdate.GPS = input.gps.toString();

      // Save the updated address
      const savedAddress = await addressRepository.save(addressToUpdate);
      user.addresses.push(savedAddress);
      await userRepository.save(user);

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deletes an address from a user's address list.
   *
   * @param {RequestContext} ctx - The request context.
   * @param {DeleteAddressInput} input - The input object containing the ID of the address to be deleted.
   * @param {Record<string, string | string[]>} headers - The headers for authorization.
   * @return {Promise<CustomCustomer>} The updated CustomCustomer object with the deleted address.
   */
  async deleteAddress(
    ctx: RequestContext,
    input: DeleteAddressInput,
    headers: Record<string, string | string[]>
  ): Promise<CustomCustomer> {
    // Verify the token
    const decodedToken = this.authMiddleware.verifyToken(headers);
    const userId = decodedToken.id;

    // Get repositories
    const userRepository = this.connection.getRepository(ctx, CustomCustomer);

    try {
      // Find the user
      const user = await userRepository.findOne({
        where: { userId: userId },
        relations: ['addresses']
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Delete the address
      const { id } = input;
      user.addresses = user.addresses.filter((address) => address.id !== id);

      const response = await userRepository.save(user);

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves all customers with their addresses.
   *
   * @param {RequestContext} ctx - the request context object
   * @return {Promise<CustomCustomer[]>} an array of CustomCustomer objects
   */
  async getAllCustomersWithAddresses(
    ctx: RequestContext
  ): Promise<CustomCustomer[]> {
    const userRepository = this.connection.getRepository(CustomCustomer);
    return userRepository.find({ relations: ['addresses'] });
  }
}
