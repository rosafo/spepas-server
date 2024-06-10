import {
  PluginCommonModule,
  VendurePlugin,
  RequestContext
} from '@vendure/core';
import { ReportResolver } from './api/report.resolver';
import { reportApiExtensions } from './api/api-extensions';
import { ReportService } from './services/report.service';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { Report } from './entities/report.entity';

interface CustomRequestContext extends RequestContext {
  AuthMiddleware: AuthMiddleware;
}

@VendurePlugin({
  imports: [PluginCommonModule],
  providers: [ReportService, AuthMiddleware],
  entities: [Report],
  shopApiExtensions: {
    schema: reportApiExtensions,
    resolvers: [ReportResolver]
  }
})
export class ReportPlugin {
  static init(options: any) {
    return ReportPlugin;
  }

  configureCtx(ctx: CustomRequestContext) {
    ctx.AuthMiddleware = new AuthMiddleware();
  }
}
