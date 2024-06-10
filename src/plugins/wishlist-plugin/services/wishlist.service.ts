import { Injectable } from '@nestjs/common';
import {
  ID,
  ProductVariantService,
  RequestContext,
  TransactionalConnection,
  UserInputError
} from '@vendure/core';
import {  CustomCustomer} from '../../customer-plugin/entities/customer.entity';
import { WishlistItem } from '../entities/wishlist-item.entity';
import { AuthMiddleware } from '../../../middlewares/auth.middleware';

@Injectable()
export class WishlistService {
  constructor(
    private connection: TransactionalConnection,
    private productVariantService: ProductVariantService,
    private readonly authMiddleware: AuthMiddleware
  ) {}

  async getWishlistItems(
    ctx: RequestContext,
    headers: Record<string, string | string[]>
  ): Promise<WishlistItem[]> {
    try {
      const decodedToken = this.authMiddleware.verifyToken(headers);
      const userId = decodedToken.id;
      const userRepository = this.connection.getRepository(ctx, CustomCustomer);

      const customer = await userRepository.findOne({
        where: { userId: userId },
        relations: ['wishlistItems', 'wishlistItems.productVariant']
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      return customer.wishlistItems;
    } catch (err: any) {
      console.error('Error retrieving wishlist items:', err);
      return [];
    }
  }

  /**
   * Adds a new item to the active Customer's wishlist.
   */
  async addItem(
    ctx: RequestContext,
    variantId: ID,
    headers: Record<string, string | string[]>
  ): Promise<WishlistItem[]> {
    const decodedToken = this.authMiddleware.verifyToken(headers);
    const userId = decodedToken.id;

    const customerRepository = this.connection.getRepository(
      ctx,
      CustomCustomer
    );
    const customer = await customerRepository.findOne({
      where: { userId: userId },
      relations: ['wishlistItems', 'wishlistItems.productVariant']
    });

    if (!customer) {
      // Handle case when customer is null
      throw new Error('Customer not found');
    }

    const variant = await this.productVariantService.findOne(ctx, variantId);
    if (!variant) {
      throw new UserInputError(
        `No ProductVariant with the id ${variantId} could be found`
      );
    }

    const existingItem = customer.wishlistItems.find(
      (i) => i.productVariantId === variantId
    );

    if (existingItem) {
      // Item already exists in wishlist, do not
      // add it again
      return customer.wishlistItems;
    }

    const wishlistItem = await this.connection
      .getRepository(ctx, WishlistItem)
      .save(new WishlistItem({ productVariantId: variantId }));
    customer.wishlistItems.push(wishlistItem);
    await customerRepository.save(customer, { reload: false });
    return this.getWishlistItems(ctx, headers);
  }

  /**
   * Removes an item from the active Customer's wishlist.
   */
  async removeItem(
    ctx: RequestContext,
    itemId: ID,
    headers: Record<string, string | string[]>
  ): Promise<WishlistItem[]> {
    const decodedToken = this.authMiddleware.verifyToken(headers);
    const userId = decodedToken.id;

    const customerRepository = this.connection.getRepository(
      ctx,
      CustomCustomer
    );
    const customer = await customerRepository.findOne({
      where: { userId: userId },
      relations: ['wishlistItems']
    });

    if (!customer) {
      // Handle case when customer is null
      throw new Error('Customer not found');
    }
    console.log("itemId", itemId);
    console.log("customer",customer.wishlistItems);

    const itemToRemove = customer.wishlistItems.find((i) => i.id === itemId);

    console.log("itemToRemove", itemToRemove);
    
    if (itemToRemove) {
      await this.connection
        .getRepository(ctx, WishlistItem)
        .remove(itemToRemove);
      customer.wishlistItems = customer.wishlistItems.filter(
        (i) => i.id !== itemId
      );
    }
    await customerRepository.save(customer);
    return this.getWishlistItems(ctx, headers);
  }
}
