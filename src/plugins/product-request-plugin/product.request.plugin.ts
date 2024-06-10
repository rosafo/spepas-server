import {
  PluginCommonModule,
  VendurePlugin,
  RequestContext,
} from '@vendure/core';
import { ProductRequestResolver } from './api/product.request.resolver';
import { productRequestsApiExtensions } from './api/api-extensions';
import { ProductRequestService } from './services/product-request.service';
import { PushNotificationService } from './services/notification.service';
import { OfferService } from './services/offer.service';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { CustomerProductRequest } from './entities/request.entity';
import { Offer } from './entities/offer.entity';

interface CustomRequestContext extends RequestContext {
  AuthMiddleware: AuthMiddleware;
}
@VendurePlugin({
  imports: [PluginCommonModule],
  providers: [
    ProductRequestService,
    PushNotificationService,
    OfferService,
    AuthMiddleware
  ],
  entities: [CustomerProductRequest, Offer],
  shopApiExtensions: {
    schema: productRequestsApiExtensions,
    resolvers: [ProductRequestResolver]
  }
})
export class ProductRequestPlugin {
  static init(options: any) {
    return ProductRequestPlugin;
  }

  configureCtx(ctx: CustomRequestContext) {
    ctx.AuthMiddleware = new AuthMiddleware();
  }
}
