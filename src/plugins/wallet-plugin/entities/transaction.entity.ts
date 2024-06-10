import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { DeepPartial, HasCustomFields, VendureEntity, ID } from '@vendure/core';
import { CustomSeller } from '../../seller-plugin/entities/seller.entity';
import { Rider } from '../../rider-plugin/entities/rider.entity';

export class CustomTransactionFields {}

@Entity()
export class Transaction extends VendureEntity implements HasCustomFields {
  constructor(input?: DeepPartial<Transaction>) {
    super(input);
  }

  @PrimaryGeneratedColumn()
  id: ID;

  @Column({ name: 'initiator_id' })
  initiatorId: number;

  @Column()
  type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  status: string;

  @ManyToOne((type) => CustomSeller, { nullable: true })
  @JoinColumn({ name: 'seller_id' })
  seller: CustomSeller;

  @ManyToOne((type) => Rider, { nullable: true })
  @JoinColumn({ name: 'rider_id' })
  rider: Rider;

  @Column((type) => CustomTransactionFields)
  customFields: CustomTransactionFields;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
