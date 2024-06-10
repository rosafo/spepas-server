import {
  PluginCommonModule,
  RequestContext,
  VendurePlugin
} from '@vendure/core';
import { CustomSeller } from './entities/seller.entity';
import { adminApiExtensions, shopApiExtensions } from './api/api-extensions';
import { SellerResolver } from './api/seller.resolver';
import { AdminSellerResolver } from './api/admin.resolver';
import { CustomSellerService } from './services/seller.service';
import { SmsService } from '../../utils/communication/sms/sms.service';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { MultivendorService } from '../multivendor-plugin/services/multi.vendor.service';
interface CustomRequestContext extends RequestContext {
  AuthMiddleware: AuthMiddleware;
}
@VendurePlugin({
  imports: [PluginCommonModule],
  entities: [CustomSeller],
  providers: [
    CustomSellerService,
    SmsService,
    MultivendorService,
    AuthMiddleware
  ],
  shopApiExtensions: {
    schema: shopApiExtensions,
    resolvers: [SellerResolver]
  },

  adminApiExtensions: {
    schema: adminApiExtensions,
    resolvers: [AdminSellerResolver]
  }
})
export class SellerPlugin {
  static init(options: any) {
    return SellerPlugin;
  }

  configureCtx(ctx: CustomRequestContext) {
    ctx.AuthMiddleware = new AuthMiddleware();
  }
}
