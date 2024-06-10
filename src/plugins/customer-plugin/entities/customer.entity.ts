import {
  Entity,
  Column,
  OneToMany,
  ManyToOne
} from 'typeorm';
import {
  DeepPartial,
  HasCustomFields,
  ID,
  Order
} from '@vendure/core';
import { CustomerProductRequest } from '../../product-request-plugin/entities/request.entity';
import { UserAddress } from './address.entity';
import { WishlistItem } from '../../wishlist-plugin/entities/wishlist-item.entity';
import { Report } from '../../report-plugin/entities/report.entity';
import { CustomUser } from '../../account-manager-plugin/entities/user.entity';

export class CustomCustomerFields {}

@Entity()
export class CustomCustomer extends CustomUser implements HasCustomFields {
  constructor(input?: DeepPartial<CustomCustomer>) {
    super(input);
  }

  @Column({nullable: true})
  userId: string;

  @Column((type) => CustomCustomerFields)
  customFields: CustomCustomerFields;

  @ManyToOne(type => Order)
  order: Order;

  @OneToMany(() => UserAddress, (address) => address.customer, {
    nullable: true
  })
  addresses: UserAddress[];

  @OneToMany(() => WishlistItem, (item) => item.customer, {
    nullable: true
  })
  wishlistItems: WishlistItem[];

  @OneToMany(() => Report, (report) => report.customer, {
    nullable: true
  })
  reports: Report[];

  @OneToMany(
    () => CustomerProductRequest,
    (productRequest) => productRequest.customer,
    {
      nullable: true
    }
  )
  productRequests: CustomerProductRequest[];
}
