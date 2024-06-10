import {
  Injectable,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import {
  RequestContext,
  TransactionalConnection,
  isGraphQlErrorResult,
  AssetService,
  ID
} from '@vendure/core';

import { OfferInput } from '../types';
import { Offer } from '../entities/offer.entity';
import { CustomerProductRequest } from '../entities/request.entity';
import { CustomSeller } from '../../seller-plugin/entities/seller.entity';
import { CustomCustomer } from '../../customer-plugin/entities/customer.entity';
import { AuthMiddleware } from '../../../middlewares/auth.middleware';
import axios from 'axios';

@Injectable()
export class OfferService {
  constructor(
    private connection: TransactionalConnection,
    private assetService: AssetService,
    private authMiddleware: AuthMiddleware
  ) {}

  async submitOffer(
    ctx: RequestContext,
    input: OfferInput,
    headers: Record<string, string | string[]>
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const decodedToken = this.authMiddleware.verifyToken(headers);
      const sellerId = decodedToken.id;

      // Get repositories
      const sellerRepository = this.connection.getRepository(ctx, CustomSeller);
      const productRequestRepository = this.connection.getRepository(
        ctx,
        CustomerProductRequest
      );

      const offerRepository = this.connection.getRepository(ctx, Offer);

      // Find the seller
      const seller = await sellerRepository.findOne({
        where: { userId: sellerId }
      });

      if (!seller) {
        throw new Error(`Seller with ID ${sellerId} not found`);
      }

      // Find the product request
      const productRequest = await productRequestRepository.findOne({
        where: { id: Number(input.productRequestId) }
      });

      if (!productRequest) {
        throw new Error(
          `Product Request with ID ${input.productRequestId} not found`
        );
      }

      // Create an Asset from the uploaded file
      const asset = await this.assetService.create(ctx, {
        file: input.file,
        tags: ['offerImage']
      });

      if (isGraphQlErrorResult(asset)) {
        throw asset;
      }

      // Create a new Offer entity
      const offer = new Offer();
      offer.productRequest = productRequest;
      offer.seller = seller;
      offer.price = input.price;
      offer.deliveryTime = input.deliveryTime;
      offer.status = 'Pending';
      offer.offerImageId = Number(asset.id);
      offer.createdAt = new Date();
      offer.updatedAt = new Date();

      // Save the offer to the database
      await offerRepository.save(offer);
      await sellerRepository.save(seller);

      return {
        success: true,
        message: 'Offer submitted successfully'
      };
    } catch (error) {
      console.error('Error submitting offer:', error);
      return {
        success: false,
        message: 'An error occurred while submitting the offer'
      };
    }
  }

  async getOffersForProductRequest(
    ctx: RequestContext,
    productRequestId: ID
  ): Promise<Offer[]> {
    try {
      console.log('ProductRequestId:', productRequestId);

      if (!productRequestId || isNaN(Number(productRequestId))) {
        throw new Error(`Invalid productRequestId: ${productRequestId}`);
      }

      const offerRepository = this.connection.getRepository(ctx, Offer);
      const offers = await offerRepository.find({
        where: { productRequest: { id: Number(productRequestId) } },
        relations: ['seller']
      });

      return offers;
    } catch (error) {
      console.error('Error retrieving offers for product request:', error);
      return [];
    }
  }

  async processOffer(
    ctx: RequestContext,
    id: string,
    decision: 'accept' | 'dismiss',
    // headers: Record<string, string | string[]>
  ) {
    // const decodedToken = this.authMiddleware.verifyToken(headers);
    // const customerId = decodedToken.id;
    // const customerRepository = this.connection.getRepository(
    //   ctx,
    //   CustomCustomer
    // );

    // const customer = await customerRepository.findOne({
    //   where: { userId: customerId },
    //   relations: ['productRequests']
    // });

    // if (!customer) {
    //   throw new NotFoundException(`customer with ID ${customerId} not found`);
    // }

    const offer = await this.connection.getRepository(ctx, Offer).findOne({
      where: { id: Number(id) }
    });

    if (!offer) {
      throw new NotFoundException(`offer with ID ${id} not found`);
    }
    if (decision === 'accept') {
      offer.status = 'accepted';
      // Assuming offer contains productVariantId
      const productVariantId = offer.productRequest.id;
      await this.addItemToCart(ctx, productVariantId);
    } else if (decision === 'dismiss') {
      offer.status = 'dismissed';
    } else {
      throw new BadRequestException(
        'Invalid decision. Decision must be either "accept" or "dismiss".'
      );
    }

    await this.connection.getRepository(ctx, Offer).save(offer);

    return {
      success: true,
      message: 'Success'
    };
  }

  private async addItemToCart(
    ctx: RequestContext,
    productVariantId: number
  ): Promise<void> {
    const ADD_ITEM_TO_ORDER = `
      mutation addItemToOrder($productVariantId: ID!, $quantity: Int!) {
        addItemToOrder(productVariantId: $productVariantId, quantity: 1) {
          __typename
          ... on Order {
            id
          }
          ... on ErrorResult {
            errorCode
          }
        }
      }
    `;

    const response = await axios.post('http://localhost:3000/shop-api', {
      query: ADD_ITEM_TO_ORDER,
      variables: { productVariantId, quantity: 1 }
    });

    const result = response.data;
    console.log(result);
    if (result.data.addItemToOrder.__typename !== 'Order') {
      throw new BadRequestException('Failed to add item to cart');
    }
  }
}
