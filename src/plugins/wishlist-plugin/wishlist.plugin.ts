import { PluginCommonModule, VendurePlugin,RequestContext } from '@vendure/core';
import { WishlistItem } from './entities/wishlist-item.entity';
import { WishlistService } from './services/wishlist.service';
import { shopApiExtensions } from './api/api-extensions';
import { WishlistShopResolver } from './api/wishlist.resolver';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import './types';

interface CustomRequestContext extends RequestContext {
  AuthMiddleware: AuthMiddleware;
}
@VendurePlugin({
  imports: [PluginCommonModule],
  providers: [WishlistService,AuthMiddleware],
  entities: [WishlistItem],
  shopApiExtensions: {
    schema: shopApiExtensions,
    resolvers: [WishlistShopResolver]
  },
  compatibility: '^2.0.0'
})
export class WishlistPlugin {
  configureCtx(ctx: CustomRequestContext) {
    ctx.AuthMiddleware = new AuthMiddleware();
  }
}
