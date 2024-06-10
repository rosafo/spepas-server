import {
  PluginCommonModule,
  RequestContext,
  VendurePlugin
} from '@vendure/core';
import { RiderRequest } from './entities/request.entity';
import { DeliveryApiExtensions } from './api/api-extensions';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { SmsService } from '../../utils/communication/sms/sms.service';
import { DeliveryResolver } from './api/delivery.resolver';
import{QRCodeResolver} from './api/qr-code.resolver'
import { DeliveryService } from './services/delivery.service';
import{ QRCodeService} from  './services/qr-code.service'
import { RiderRequestSubmittedEvent, RiderRequestProcessedEvent } from './events/index';

interface CustomRequestContext extends RequestContext {
  AuthMiddleware: AuthMiddleware;
}
@VendurePlugin({
  imports: [PluginCommonModule],
  entities: [RiderRequest],
  providers: [DeliveryService, SmsService, AuthMiddleware,QRCodeService],
  shopApiExtensions: {
    schema: DeliveryApiExtensions,
    resolvers: [DeliveryResolver,QRCodeResolver]
  },
  compatibility: '^2.0.0'
})
  

export class DeliveryPlugin {
  static init(options: any) {
    return DeliveryPlugin;
  }

  configureCtx(ctx: CustomRequestContext) {
    ctx.AuthMiddleware = new AuthMiddleware();
  }
}
