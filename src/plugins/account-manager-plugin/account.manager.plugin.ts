import {
  PluginCommonModule,
  RequestContext,
  VendurePlugin
} from '@vendure/core';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { CustomUser } from './entities/user.entity';
import { UserApiExtensions } from './api/api-extensions';
import { UserResolver } from './api/account.manager.resolver';
import { UserService } from './services/account.manager.service';
import { SmsService } from './communication/sms/sms.service';
import { EmailService } from './communication/email/email.service';

interface CustomRequestContext extends RequestContext {
  AuthMiddleware: AuthMiddleware;
}

@VendurePlugin({
  imports: [PluginCommonModule],
  entities: [CustomUser],
  providers: [UserService, SmsService, EmailService, AuthMiddleware],
  shopApiExtensions: {
    schema: UserApiExtensions,
    resolvers: [UserResolver]
  },
  compatibility: '^2.0.0'
})
export class AccountManagerPlugin {
  static init(options: any) {
    return AccountManagerPlugin;
  }

  configureCtx(ctx: CustomRequestContext) {
    ctx.AuthMiddleware = new AuthMiddleware();
  }
}
