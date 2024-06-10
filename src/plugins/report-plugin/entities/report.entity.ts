import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { DeepPartial, ID, VendureEntity, Asset } from '@vendure/core';
import {  CustomCustomer} from '../../customer-plugin/entities/customer.entity';

@Entity()
export class Report extends VendureEntity {
  constructor(input?: DeepPartial<Report>) {
    super(input);
  }

  @PrimaryGeneratedColumn()
  id: ID;

  @Column()
  orderNumber: string;

  @Column()
  issueType: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  itemImageId: ID;

  @ManyToOne((type) => Asset)
  @JoinColumn()
  itemImage: Asset;

  @ManyToOne(() => CustomCustomer, (customer) => customer.reports, {
    nullable: true
  })
  customer: CustomCustomer;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
