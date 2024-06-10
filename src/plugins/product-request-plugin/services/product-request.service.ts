import { Injectable, NotFoundException } from '@nestjs/common';
import {
  RequestContext,
  TransactionalConnection,
  isGraphQlErrorResult,
  AssetService,
  ID
} from '@vendure/core';
import { ProductRequestInput, EditRequestInput } from '../types';
import { CustomerProductRequest } from '../entities/request.entity';
import { PushNotificationService } from './notification.service';
import { AuthMiddleware } from '../../../middlewares/auth.middleware';
import { CustomCustomer } from '../../customer-plugin/entities/customer.entity';

@Injectable()
export class ProductRequestService {
  constructor(
    private connection: TransactionalConnection,
    private assetService: AssetService,
    private pushNotificationService: PushNotificationService,
    private authMiddleware: AuthMiddleware
  ) {}

  async getProductRequest(
    ctx: RequestContext,
    headers: Record<string, string | string[]>
  ): Promise<CustomerProductRequest[]> {
    try {
      const decodedToken = this.authMiddleware.verifyToken(headers);
      const userId = decodedToken.id;
      const userRepository = this.connection.getRepository(ctx, CustomCustomer);
      const customer = await userRepository.findOne({
        where: { userId: userId },
        relations: [
          'productRequests',
          'productRequests.productRequestImage',
          'productRequests.offers',
          'productRequests.offers.seller'
        ]
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      return customer.productRequests;
    } catch (err: any) {
      console.error('Error retrieving productRequests:', err);
      return [];
    }
  }

  async getProductRequestsForSellers(
    ctx: RequestContext
  ): Promise<CustomerProductRequest[]> {
    try {
      const productRequestRepository = this.connection.getRepository(
        ctx,
        CustomerProductRequest
      );
      return productRequestRepository.find({
        where: { status: 'Open' },
        relations: ['productRequestImage', 'offers']
      });
    } catch (err: any) {
      console.error('Error retrieving productRequests for sellers:', err);
      return [];
    }
  }

  async submitProductRequest(
    ctx: RequestContext,
    input: ProductRequestInput,
    file: any,
    headers: Record<string, string | string[]>
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const decodedToken = this.authMiddleware.verifyToken(headers);
      const userId = decodedToken.id;

      // Get repositories
      const userRepository = this.connection.getRepository(ctx, CustomCustomer);
      const productRequestRepository = this.connection.getRepository(
        ctx,
        CustomerProductRequest
      );

      // Find the user with relations
      const user = await userRepository.findOne({
        where: { userId: userId },
        relations: ['productRequests']
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Create an Asset from the uploaded file
      const asset = await this.assetService.create(ctx, {
        file,
        tags: ['productRequestImage']
      });

      if (isGraphQlErrorResult(asset)) {
        throw asset;
      }

      // Create a new ProductRequest entity
      const productRequest = new CustomerProductRequest();
      productRequest.productName = input.productName;
      productRequest.quantity = input.quantity;
      productRequest.make = input.make;
      productRequest.model = input.model;
      productRequest.description = input.description;
      productRequest.year = input.year;
      productRequest.countryOfOrigin = input.countryOfOrigin;
      productRequest.condition = input.condition;
      productRequest.customer = user;
      productRequest.productRequestImageId = Number(asset.id);
      productRequest.status = 'Open';

      // Save the product request to the database
      const savedRequest = await productRequestRepository.save(productRequest);
      // await this.notifySellersAboutNewProductRequest(productRequest);
      user.productRequests.push(savedRequest);
      await userRepository.save(user);

      return {
        success: true,
        message: 'Request submitted successfully'
      };
    } catch (error) {
      console.error('Error submitting product request:', error);
      return {
        success: false,
        message: 'An error occurred while submitting the request'
      };
    }
  }

  async deleteProductRequest(
    ctx: RequestContext,
    itemId: ID,
    headers: Record<string, string | string[]>
  ): Promise<CustomerProductRequest[]> {
    const decodedToken = this.authMiddleware.verifyToken(headers);
    const userId = decodedToken.id;

    const customerRepository = this.connection.getRepository(
      ctx,
      CustomCustomer
    );
    const customer = await customerRepository.findOne({
      where: { userId: userId },
      relations: ['productRequests']
    });

    if (!customer) {
      // Handle case when customer is null
      throw new Error('Customer not found');
    }

    const itemToRemove = customer.productRequests.find(
      (item) => item.id === itemId
    );
    if (itemToRemove) {
      await this.connection
        .getRepository(ctx, CustomerProductRequest)
        .remove(itemToRemove);
      customer.productRequests = customer.productRequests.filter(
        (i) => i.id !== itemId
      );
    }

    await customerRepository.save(customer);
    return this.getProductRequest(ctx, headers);
  }

  async editProductRequest(
    ctx: RequestContext,
    input: EditRequestInput,
    file: any,
    headers: Record<string, string | string[]>
  ): Promise<CustomerProductRequest[]> {
    const decodedToken = this.authMiddleware.verifyToken(headers);
    const userId = decodedToken.id;
    // Get repositories
    const customerRepository = this.connection.getRepository(
      ctx,
      CustomCustomer
    );
    const requestRepository = this.connection.getRepository(
      ctx,
      CustomerProductRequest
    );

    const customer = await customerRepository.findOne({
      where: { userId: userId },
      relations: ['productRequests']
    });

    if (!customer) {
      throw new NotFoundException('customer not found');
    }
    try {
      const requestToUpdate = customer.productRequests.find(
        (request) => request.id === input.id
      );

      if (!requestToUpdate) {
        throw new NotFoundException('request not found');
      }

      // Update the request properties
      requestToUpdate.productName = input.productName.toString();
      requestToUpdate.quantity = Number(input.quantity);
      requestToUpdate.make = input.make.toString();
      requestToUpdate.model = input.model.toString();
      requestToUpdate.description = input.description.toString();
      requestToUpdate.year = input.year.toString();
      requestToUpdate.countryOfOrigin = input.countryOfOrigin.toString();
      requestToUpdate.condition = input.condition.toString();

      if (file) {
        const asset = await this.assetService.create(ctx, {
          file,
          tags: ['productRequestImage']
        });

        if (isGraphQlErrorResult(asset)) {
          throw asset;
        }

        requestToUpdate.productRequestImageId = Number(asset.id);
      }

      const savedRequest = await requestRepository.save(requestToUpdate);
      // await this.notifySellersAboutNewProductRequest(productRequest);
      customer.productRequests.push(savedRequest);
      await customerRepository.save(customer);
      return this.getProductRequest(ctx, headers);
    } catch (error) {
      throw error;
    }
  }

  private async notifySellersAboutNewProductRequest(
    productRequest: CustomerProductRequest
    // ctx: RequestContext,
  ) {
    console.log('notification sent ');
    // Fetch all sellers who need to be notified (you may have a different logic for this)
    // const sellers = await this.connection
    //   .getRepository(ctx, Seller)
    //   .find(/* Criteria */);
    // for (const seller of sellers) {
    //   // Send push notification to each seller
    //   await this.pushNotificationService.sendNotificationToSeller(
    //     seller,
    //     productRequest
    //   );
    // }
  }
}
