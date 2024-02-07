import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { CustomCustomer } from './entities/customer.entity';
import { customerApiExtensions } from './api/api-extensions';
import { CustomerResolver } from './api/customer.resolver';
import { CustomerService } from './services/customer.service';
import { SmsService } from './communication/sms/sms.service';
import { EmailService } from './communication/email/email.service';

@VendurePlugin({
  imports: [PluginCommonModule],
  entities: [CustomCustomer],
  providers: [CustomerService, SmsService, EmailService],
  shopApiExtensions: {
    schema: customerApiExtensions,
    resolvers: [CustomerResolver]
  }
})
export class AccountManagerPlugin {}
