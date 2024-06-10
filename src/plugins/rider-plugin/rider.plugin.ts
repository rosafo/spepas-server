import {
  PluginCommonModule,
  RequestContext,
  VendurePlugin
} from '@vendure/core';
import { Rider } from './entities/rider.entity';
import { adminApiExtensions,shopApiExtensions } from './api/api-extensions';
import { RiderResolver } from './api/rider.resolver';
import { AdminRiderResolver } from './api/admin.resolver';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { RiderService } from './services/rider.service';
import { SmsService } from '../../utils/communication/sms/sms.service';

interface CustomRequestContext extends RequestContext {
  AuthMiddleware: AuthMiddleware;
}
@VendurePlugin({
  imports: [PluginCommonModule],
  entities: [Rider],
  providers: [RiderService, SmsService, AuthMiddleware],
  shopApiExtensions: {
    schema: shopApiExtensions,
    resolvers: [RiderResolver]
  },
  adminApiExtensions: {
    schema: adminApiExtensions,
    resolvers: [AdminRiderResolver]
  }
  ,
  compatibility: '^2.0.0'
})
export class RiderPlugin {
  static init(options: any) {
    return RiderPlugin;
  }

  configureCtx(ctx: CustomRequestContext) {
    ctx.AuthMiddleware = new AuthMiddleware();
  }
}
