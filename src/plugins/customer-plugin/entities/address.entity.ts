import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne } from 'typeorm';
import {ID } from '@vendure/core';

import { CustomCustomer } from './customer.entity'; 
@Entity()
export class UserAddress extends BaseEntity {
  
  @PrimaryGeneratedColumn()
  id: ID;

  @Column({ nullable: true })
  title: string;
  
  @Column({ nullable: true })
  city: string;
  
  @Column({ nullable: true })
  street: string;
  
  @Column({ nullable: true })
  GPS: string;  

  @ManyToOne(() => CustomCustomer, (customer) => customer.addresses,{
    nullable: true
  })
  customer: CustomCustomer;
  
}
