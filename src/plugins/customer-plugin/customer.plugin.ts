import {
    PluginCommonModule,
    RequestContext,
    VendurePlugin
  } from '@vendure/core';
  import { AuthMiddleware } from '../../middlewares/auth.middleware';
  import {
    CustomCustomer,
    CustomCustomerFields
  } from './entities/customer.entity';
  import { UserAddress } from './entities/address.entity';
  import { customerApiExtensions } from './api/api-extensions';
  import { CustomerResolver } from './api/customer.resolver';
  import { CustomerService } from './services/customer.service';
  import { SmsService } from './communication/sms/sms.service';
  import { EmailService } from './communication/email/email.service';
  
  interface CustomRequestContext extends RequestContext {
    AuthMiddleware: AuthMiddleware;
  }
  
  @VendurePlugin({
    imports: [PluginCommonModule],
    entities: [CustomCustomer, UserAddress, CustomCustomerFields],
    providers: [CustomerService, SmsService, EmailService, AuthMiddleware],
    shopApiExtensions: {
      schema: customerApiExtensions,
      resolvers: [CustomerResolver]
    },
    compatibility: '^2.0.0'
  })
  export class CustomerPLugin {
    static init(options: any) {
      return CustomerPLugin;
    }
  
    configureCtx(ctx: CustomRequestContext) {
      ctx.AuthMiddleware = new AuthMiddleware();
    }
  }
  