import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { DeepPartial, Asset, ID, HasCustomFields } from '@vendure/core';
import { RiderRequest } from '../../order-delivery-plugin/entities/request.entity';
import { Wallet } from '../../wallet-plugin/entities/wallet.entity';
import { Transaction } from '../../wallet-plugin/entities/transaction.entity';
import { CustomUser } from '../../account-manager-plugin/entities/user.entity';

export class CustomRiderFields {}

@Entity()
export class Rider extends CustomUser implements HasCustomFields {
  constructor(input?: DeepPartial<Rider>) {
    super(input);
  }

  @Column({ nullable: true })
  userId: string;

  @Column()
  vehicleRegistrationFileId: ID;

  @Column()
  nationalIdCardId: ID;

  @Column({ default: false })
  online: boolean;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column('decimal', { precision: 2, scale: 1, default: 5.0, nullable: true })
  rating: number;

  @Column()
  vehicleType: string;

  @ManyToOne(() => Asset)
  vehicleRegistrationFile: Asset;

  @ManyToOne(() => Asset)
  nationalIdCard: Asset;

  @Column({ default: 'pending' })
  status: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.rider)
  wallet: Wallet;

  @Column((type) => CustomRiderFields)
  customFields: CustomRiderFields;

  @OneToMany(() => Transaction, (transaction) => transaction.rider)
  transactions: Transaction[];

  @OneToMany(() => RiderRequest, (request) => request.rider)
  requests: RiderRequest[];
}
