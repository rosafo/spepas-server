import { registerRouteComponent } from '@vendure/admin-ui/core';
import { GreeterComponent } from './components/greeter/greeter.component';

export default [
    registerRouteComponent({
        component: GreeterComponent,
        path: '',
        title: 'Test',
        breadcrumb: 'Test',
    }),
];