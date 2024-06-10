import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  TableInheritance
} from 'typeorm';
import { DeepPartial, VendureEntity, Asset, ID } from '@vendure/core';

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class CustomUser extends VendureEntity {
  constructor(input?: DeepPartial<CustomUser>) {
    super(input);
  }

  @PrimaryGeneratedColumn()
  id: ID;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phone: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  avatarId: ID;

  @Column({ nullable: true })
  fullName: string;

  @ManyToOne(() => Asset)
  @JoinColumn()
  avatar: Asset;

  @Column('simple-array', { nullable: true })
  roles: string[];

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
