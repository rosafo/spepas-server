import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { CustomSeller } from '../../seller-plugin/entities/seller.entity';
import { CustomerProductRequest } from './request.entity';
import { Asset } from '@vendure/core';
@Entity()
export class Offer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CustomSeller)
  seller: CustomSeller;

  @Column('float')
  price: number;

  @Column()
  deliveryTime: string;

  @Column('text', { nullable: true })
  status: string;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @Column({ nullable: true })
  offerImageId: number;

  @ManyToOne((type) => Asset)
  @JoinColumn()
  offerImage: Asset;

  @ManyToOne(() => CustomerProductRequest, (request) => request.offers)
  productRequest: CustomerProductRequest;
}
