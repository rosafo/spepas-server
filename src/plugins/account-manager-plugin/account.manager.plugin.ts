import {
  Asset,
  LanguageCode,
  PluginCommonModule,
  VendurePlugin
} from '@vendure/core';
import { AuthMiddleware } from '../utils/auth.middleware'; 
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
  },
  configuration: (config) => {
    config.customFields.Customer.push({
      name: 'avatar',
      type: 'relation',
      label: [{ languageCode: LanguageCode.en, value: 'Customer avatar' }],
      entity: Asset,
      nullable: true
    });
    
    return config;
  }
})
export class AccountManagerPlugin {
  static init(options: any) {
    options.plugins.push(AuthMiddleware);
    return AccountManagerPlugin;
  }
}

