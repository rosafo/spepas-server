import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';
import {
  DeepPartial,
  HasCustomFields,
  VendureEntity,
  Asset
} from '@vendure/core';
import { CustomCustomer } from '../../customer-plugin/entities/customer.entity';
import { Offer } from './offer.entity';

export class CustomSellerFields {}

export class CustomeProductRequestFields {}

@Entity()
export class CustomerProductRequest
  extends VendureEntity
  implements HasCustomFields
{
  constructor(input?: DeepPartial<CustomerProductRequest>) {
    super(input);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column((type) => CustomeProductRequestFields)
  customFields: CustomeProductRequestFields;

  @Column()
  productName: string;

  @Column()
  quantity: number;

  @Column()
  make: string;

  @Column()
  model: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  year: string;

  @Column({ nullable: true })
  countryOfOrigin?: string;

  @Column()
  condition: string;

  @Column({ nullable: true })
  productRequestImageId: number;

  @OneToMany(() => Offer, (offer) => offer.productRequest)
  offers: Offer[];

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  bestBidAmount: number;

  @ManyToOne((type) => Asset)
  @JoinColumn()
  productRequestImage: Asset;

  @ManyToOne(() => CustomCustomer, (customer) => customer.productRequests)
  customer: CustomCustomer;
}
