import {
  DeepPartial,
  ID,
  ProductVariant,
  VendureEntity,
  EntityId
} from '@vendure/core';
import { Column, Entity, ManyToOne } from 'typeorm';
import {  CustomCustomer} from '../../customer-plugin/entities/customer.entity';

@Entity()
export class WishlistItem extends VendureEntity {
  constructor(input?: DeepPartial<WishlistItem>) {
    super(input);
  }

  @ManyToOne((type) => ProductVariant)
  productVariant: ProductVariant;

  @EntityId()
  productVariantId: ID;

  @ManyToOne(() => CustomCustomer, (customer) => customer.wishlistItems, {
    nullable: true
  })
  customer: CustomCustomer;
}
