import { Entity, PrimaryGeneratedColumn, Column, ManyToOne,JoinColumn } from 'typeorm';
import { Rider } from '../../rider-plugin/entities/rider.entity';
import { CustomSeller } from '../../seller-plugin/entities/seller.entity';
import { DeepPartial, HasCustomFields, VendureEntity, ID,Asset,Order } from '@vendure/core';

export class CustomRiderRequestFields {}

@Entity()
export class RiderRequest extends VendureEntity implements HasCustomFields {
  constructor(input?: DeepPartial<RiderRequest>) {
    super(input);
  }
  @PrimaryGeneratedColumn()
  id: ID;

  @Column()
  pickUpAddress: string;

  @Column('float')
  pickUpDistance: number;

  @Column()
  dropOffAddress: string;

  @Column('float')
  dropOffDistance: number;

  @Column('float')
  totalDistance: number;

  @Column('float')
  payment: number;
  
  @Column()
  deliveryProofId: number;

  @Column()
  estimatedTime: string;

  @Column({ default: 'pending' })
  status: string;

  @ManyToOne(type => Order)
  order: Order;

  @Column((type) => CustomRiderRequestFields)
  customFields: CustomRiderRequestFields;

  @ManyToOne(() => Rider, (rider) => rider.requests)
  rider: Rider;

  @ManyToOne(() => CustomSeller, (customSeller) => customSeller.riderRequests)
  seller: CustomSeller;

  @ManyToOne((type) => Asset)
  @JoinColumn()
  deliveryProof: Asset;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
