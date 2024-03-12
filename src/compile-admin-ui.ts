import { compileUiExtensions } from '@vendure/ui-devkit/compiler';
import path from 'path';

if (require.main === module) {
    customAdminUi({ recompile: true, devMode: false })
        .compile?.()
        .then(() => {
            process.exit(0);
        });
}
 
export function customAdminUi(options: { recompile: boolean; devMode: boolean }) {
    const compiledAppPath = path.join(__dirname, 'admin-ui');
    if (options.recompile) {
        return compileUiExtensions({
            outputPath: compiledAppPath,
            extensions: [{
                extensionPath: path.join(__dirname, 'plugins/seller-plugin/ui'),
                providers: ['providers.ts'],
                ngModules: [{
                    type: 'lazy',
                    route: 'pending',
                    ngModuleFileName: 'seller.module.ts',
                    ngModuleName: 'PendingSellerModule',
                }],
            }],
            devMode: options.devMode,
        });
    } else {
        return {
            path: path.join(compiledAppPath, '../admin-ui/dist'),
        };
    }
}