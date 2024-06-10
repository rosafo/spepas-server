import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { DeepPartial, HasCustomFields, VendureEntity, ID } from '@vendure/core';
import { Rider } from '../../rider-plugin/entities/rider.entity';
import { CustomSeller } from '../../seller-plugin/entities/seller.entity';

export class CustomWalletFields {}

@Entity()
export class Wallet extends VendureEntity implements HasCustomFields {
  constructor(input?: DeepPartial<Wallet>) {
    super(input);
  }
  
  @PrimaryGeneratedColumn()
  id: ID;

  @Column({ length: 255 })
  fullName: string;

  @Column({ length: 255 })
  recipients: string; 

  @Column({ length: 255 })
  email: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 }) 
  balance: number;

  @Column({ length: 100 }) 
  paymentMethod: string;

  @Column()
  accountNumber: number;

  @Column((type) => CustomWalletFields)
  customFields: CustomWalletFields;

  @ManyToOne(() => Rider, { nullable: true }) 
  @JoinColumn()
  rider: Rider;

  @ManyToOne(() => CustomSeller, { nullable: true }) 
  @JoinColumn()
  seller: CustomSeller;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
