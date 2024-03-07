import {
  Asset,
  LanguageCode,
  PluginCommonModule,
  RequestContext,
  VendurePlugin,
} from '@vendure/core';
import { CustomSeller } from './entities/seller.entity';
import { SellerApiExtensions } from './api/api-extensions';
import { SellerResolver } from './api/seller.resolver';
import { CustomSellerService } from './services/seller.service';
import { SmsService } from './communication/sms/sms.service';
import { AuthMiddleware } from '../utils/auth.middleware';
import {MultivendorService} from '../multivendor-plugin/services/multi.vendor.service'
interface CustomRequestContext extends RequestContext {
  AuthMiddleware: AuthMiddleware;
}
@VendurePlugin({
  imports: [PluginCommonModule],
  entities: [CustomSeller],
  providers: [CustomSellerService, SmsService,MultivendorService],
  shopApiExtensions: {
    schema: SellerApiExtensions,
    resolvers: [SellerResolver]
  },
  adminApiExtensions: {
    schema: SellerApiExtensions,
    resolvers: [SellerResolver]
  },
  configuration: (config) => {
    config.customFields.Seller.push({
      name: 'avatar',
      type: 'relation',
      label: [{ languageCode: LanguageCode.en, value: 'seller avatar' }],
      entity: Asset,
      nullable: true
    });

    return config;
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
