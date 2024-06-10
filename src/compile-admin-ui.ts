import { compileUiExtensions, setBranding } from '@vendure/ui-devkit/compiler';
import { ReviewsPlugin } from './plugins/reviews/reviews-plugin';
import path from 'path';


const compiledAppPath = path.join(__dirname,  './admin-ui');

compileUiExtensions({
  outputPath: compiledAppPath,
  extensions: [
    setBranding({
      smallLogoPath: path.join(__dirname, './images/my-logo-sm.png'),
      largeLogoPath: path.join(__dirname, './images/logo-login.png'),
      faviconPath: path.join(__dirname, './images/favicon.ico')
    }),
    ReviewsPlugin.uiExtensions,
    {
      extensionPath: path.join(__dirname, './plugins/seller-plugin/ui'),
      providers: ['providers.ts'],
      ngModules: [
        {
          type: 'lazy',
          route: 'pending-sellers',
          ngModuleFileName: 'seller.module.ts',
          ngModuleName: 'PendingSellerModule'
        }
      ]
    },
    {
      extensionPath: path.join(__dirname, './plugins/rider-plugin/ui'),
      providers: ['providers.ts'],
      ngModules: [
        {
          type: 'lazy',
          route: 'pending-riders',
          ngModuleFileName: 'rider.module.ts',
          ngModuleName: 'PendingRiderModule'
        }
      ]
    }
  ],
  devMode: true
})
  .compile?.()
  .then(() => {
    process.exit(0);
  });
