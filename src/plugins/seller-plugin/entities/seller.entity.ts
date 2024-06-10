import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { DeepPartial, Asset, ID } from '@vendure/core';
import { Offer } from '../../product-request-plugin/entities/offer.entity';
import { Wallet } from '../../wallet-plugin/entities/wallet.entity';
import { Transaction } from '../../wallet-plugin/entities/transaction.entity';
import { RiderRequest } from '../../order-delivery-plugin/entities/request.entity';
import { CustomUser } from '../../account-manager-plugin/entities/user.entity';

@Entity()
export class CustomSeller extends CustomUser {
  constructor(input?: DeepPartial<CustomSeller>) {
    super(input);
  }

  @Column({ nullable: true })
  userId: string;

  @Column({ length: 100 })
  shopName: string;

  @Column({ length: 20 })
  TIN: string;

  @Column()
  businessRegistrationFileId: ID;

  @Column({ length: 255 })
  shopAddress: string;

  @Column({ type: 'text' })
  aboutShop: string;

  @Column({ default: 'pending' })
  status: string;

  @ManyToOne(() => Asset, { nullable: true })
  businessRegistrationFile: Asset;

  @OneToMany(() => Transaction, (transaction) => transaction.seller)
  transactions: Transaction[];

  @ManyToOne(() => Wallet, (wallet) => wallet.seller)
  wallet: Wallet;

  @OneToMany(() => Offer, (offer) => offer.seller)
  offers: Offer[];

  @OneToMany(() => RiderRequest, (request) => request.seller)
  riderRequests: RiderRequest[];
}
