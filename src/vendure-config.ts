import {
  dummyPaymentHandler,
  DefaultJobQueuePlugin,
  VendureConfig,
  LanguageCode,
  UuidIdStrategy
} from '@vendure/core';
import { HardenPlugin } from '@vendure/harden-plugin';
import { defaultEmailHandlers, EmailPlugin } from '@vendure/email-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import { ElasticsearchPlugin } from '@vendure/elasticsearch-plugin';
import { AccountManagerPlugin } from './plugins/account-manager-plugin/account.manager.plugin';
import { MultivendorPlugin } from './plugins/multivendor-plugin/multivendor.plugin';
import { elasticsearchOptions } from './elasticsearch-options';
import { GoogleAuthPlugin } from './plugins/google-auth/google-auth-plugin';
import 'dotenv/config';
import path from 'path';
import { SearchSortPlugin } from './plugins/search-sort-plugin/search-sort-plugin';

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const IS_DEV = process.env.APP_ENV === 'dev';
export const config: VendureConfig = {
  apiOptions: {
    port: 3000,
    adminApiPath: 'admin-api',
    shopApiPath: 'shop-api',
    // The following options are useful in development mode,
    // but are best turned off for production for security
    // reasons.
    cors: {
      origin: '*',
      methods: 'GET, PUT, POST, DELETE',
      credentials: true
    },
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
    },
    requireVerification: true
    // shopAuthenticationStrategy: [
    //   facebookAuthenticationStrategy,
    //   googleAuthenticationStrategy
    // ]
  },
  entityOptions: {
    entityIdStrategy: new UuidIdStrategy(),
},
  dbConnectionOptions: {
    type: 'better-sqlite3',
    // See the README.md "Migrations" section for an explanation of
    // the `synchronize` and `migrations` options.
    synchronize: false,
    migrations: [path.join(__dirname, './migrations/*.+(js|ts)')],
    logging: false,
    database: path.join(__dirname, '../vendure.sqlite')
  },
  paymentOptions: {
    paymentMethodHandlers: [dummyPaymentHandler]
  },
  // When adding or altering custom field definitions, the database will
  // need to be updated. See the "Migrations" section in README.md.
  customFields: {
    Product: [
      { name: 'Make', type: 'string' },
      { name: 'Model', type: 'string' },
      { name: 'Year', type: 'int' },
      { name: 'numStars', type: 'int' },
      { name: 'averageRating', type: 'float' },
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

      { name: 'isFavorite', type: 'boolean' }
    ],

    User: [
      {
        name: 'socialLoginToken',
        type: 'string',
        public: false
      }
    ]
  },

  plugins: [
    AssetServerPlugin.init({
      route: 'assets',
      assetUploadDir: path.join(__dirname, '../static/assets'),
      // For local dev, the correct value for assetUrlPrefix should
      // be guessed correctly, but for production it will usually need
      // to be set manually to match your production url.
      assetUrlPrefix: IS_DEV ? undefined : 'https://www.my-shop.com/assets/'
    }),
    GoogleAuthPlugin.init({
      clientId: googleClientId
    }),
    MultivendorPlugin.init({
      platformFeePercent: 10,
      platformFeeSKU: 'FEE'
    }),
    DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),

    ElasticsearchPlugin.init({
      host: process.env.ELASTICSEARCH_HOST,
      port: 9200,
      ...elasticsearchOptions
    }),

    HardenPlugin.init({
      maxQueryComplexity: 500,
      apiMode: IS_DEV ? 'dev' : 'prod',
    }),

    EmailPlugin.init({
      devMode: true,
      outputPath: path.join(__dirname, '../static/email/test-emails'),
      route: 'mailbox',
      handlers: defaultEmailHandlers,
      templatePath: path.join(__dirname, '../static/email/templates'),
      globalTemplateVars: {
        // The following variables will change depending on your storefront implementation.
        // Here we are assuming a storefront running at http://localhost:8080.
        fromAddress: '"example" <noreply@example.com>',
        verifyEmailAddressUrl: 'http://localhost:8080/verify',
        passwordResetUrl: 'http://localhost:8080/password-reset',
        changeEmailAddressUrl:
          'http://localhost:8080/verify-email-address-change'
      }
    }),
    AdminUiPlugin.init({
      route: 'admin',
      port: 3002,
      adminUiConfig: {
        apiPort: 3000
      }
    }),
    AccountManagerPlugin
    // SearchSortPlugin
  ]
};

