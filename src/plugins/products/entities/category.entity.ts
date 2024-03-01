import {ManyToOne, Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';
import {VendureEntity } from '@vendure/core';
@Entity()
export class CustomCategory extends VendureEntity {
  constructor() {
    super();
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  parentId: string;

  @Column({ nullable: true })
  path: string;

  @Column({ nullable: true })
  level: number;

  @Column({ nullable: true })
  position: number;
    
  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
    
  @ManyToOne(() => CustomCategory, { nullable: true, onDelete: 'SET NULL' })
  parent: CustomCategory;
}