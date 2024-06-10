import { VendurePlugin, PluginCommonModule } from '@vendure/core';
import { walletAdminApiExtensions } from './api/api-extentions';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';

@VendurePlugin({
  imports: [PluginCommonModule],
  entities: [Wallet, Transaction],
  providers: [],
  shopApiExtensions: {
    schema: walletAdminApiExtensions,
    resolvers: []
  },
  adminApiExtensions: {
    schema: walletAdminApiExtensions,
    resolvers: []
  },
  compatibility: '^2.0.0'
})
export class WalletPlugin {}
