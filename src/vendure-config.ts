import {
  dummyPaymentHandler,
  DefaultJobQueuePlugin,
  DefaultSearchPlugin,
  VendureConfig,
  LanguageCode
} from '@vendure/core';
import { defaultEmailHandlers, EmailPlugin } from '@vendure/email-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import 'dotenv/config';
import path from 'path';
import { AccountManagerPlugin } from './plugins/account-manager-plugin/account.manager.plugin';
import { CustomerPLugin } from './plugins/customer-plugin/customer.plugin';
import { ProductRequestPlugin } from './plugins/product-request-plugin/product.request.plugin';
import { MultivendorPlugin } from './plugins/multivendor-plugin/multivendor.plugin';
import { SellerPlugin } from './plugins/seller-plugin/seller.plugin';
import { WishlistPlugin } from './plugins/wishlist-plugin/wishlist.plugin';
import { ReviewsPlugin } from './plugins/reviews/reviews-plugin';
import { ReportPlugin } from './plugins/report-plugin/report.plugin';
import { RiderPlugin } from './plugins/rider-plugin/rider.plugin';
import { WalletPlugin } from './plugins/wallet-plugin/wallet.plugin';
import { DeliveryPlugin } from './plugins/order-delivery-plugin/delivery.plugin';

const IS_PROD = process.env.APP_ENV === 'prod';
const IS_DEV = process.env.APP_ENV === 'dev';

export const config: VendureConfig = {
  apiOptions: {
    port: +(process.env.PORT || 3000),
    adminApiPath: 'admin-api',
    shopApiPath: 'shop-api',
    ...(IS_DEV
      ? {
          adminApiPlayground: {
            settings: { 'request.credentials': 'include' }
          },
          adminApiDebug: true,
          shopApiPlayground: {
            settings: { 'request.credentials': 'include' }
          },
          shopApiDebug: true
        }
      : {})
  },
  authOptions: {
    tokenMethod: ['bearer', 'cookie'],
    superadminCredentials: {
      identifier: process.env.SUPERADMIN_USERNAME,
      password: process.env.SUPERADMIN_PASSWORD
    },
    cookieOptions: {
      secret: process.env.COOKIE_SECRET
    }
  },
  dbConnectionOptions: {
    type: 'postgres',
    synchronize: false,
    migrations: [path.join(__dirname, './migrations/*.+(js|ts)')],
    logging: false,
    database: process.env.DB_NAME,
    schema: process.env.DB_SCHEMA,
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    ssl: true
  },
  paymentOptions: {
    paymentMethodHandlers: [dummyPaymentHandler]
  },
  customFields: {
    Product: [
      { name: 'Make', type: 'string' },
      { name: 'Description', type: 'string' },
      { name: 'Model', type: 'string' },
      { name: 'Year', type: 'int' },
      { name: 'CountryOfOrigin', type: 'string' },
      {
        name: 'Condition',
        type: 'string',
        options: [
          {
            value: 'New',
            label: [{ languageCode: LanguageCode.en, value: 'New' }]
          },
          {
            value: 'HomeUsed',
            label: [{ languageCode: LanguageCode.en, value: 'Used' }]
          },
          {
            value: 'SecondHand',
            label: [{ languageCode: LanguageCode.en, value: 'Second Hand' }]
          }
        ]
      },
      { name: 'Category', type: 'string' },
      { name: 'Subcategory', type: 'string' }
    ]
  },
  plugins: [
    AssetServerPlugin.init({
      route: 'assets',
      assetUploadDir: path.join(__dirname, '../static/assets'),
      assetUrlPrefix: IS_DEV ? undefined : 'https://www.my-shop.com/assets/'
    }),
    DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
    DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
    EmailPlugin.init({
      devMode: true,
      outputPath: path.join(__dirname, '../static/email/test-emails'),
      route: 'mailbox',
      handlers: defaultEmailHandlers,
      templatePath: path.join(__dirname, '../static/email/templates'),
      globalTemplateVars: {
        fromAddress: '"example" <noreply@example.com>',
        verifyEmailAddressUrl: 'http://localhost:8080/verify',
        passwordResetUrl: 'http://localhost:8080/password-reset',
        changeEmailAddressUrl:
          'http://localhost:8080/verify-email-address-change'
      }
    }),
    AccountManagerPlugin,
    CustomerPLugin,
    WishlistPlugin,
    ProductRequestPlugin,
    SellerPlugin,
    MultivendorPlugin,
    ReviewsPlugin,
    ReportPlugin,
    RiderPlugin,
    WalletPlugin,
    DeliveryPlugin,
    AdminUiPlugin.init({
      route: 'admin',
      port: 3002,
      adminUiConfig: {
        apiHost: 'https://spepas-api-v1.onrender.com',
        // apiHost:'http://localhost',
        apiPort: 443,
        brand: 'SpePas-Admin',
        hideVendureBranding: true,
        hideVersion: false
      },
      // app: {
      //   path: path.join(__dirname, './admin-ui/src')
      // }
    })
  ]
};
