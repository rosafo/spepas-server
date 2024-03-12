// import { addNavMenuItem } from '@vendure/admin-ui/core';

// export default [
//   addNavMenuItem({
//     id: 'pending-sellers',
//     label: 'Pending Sellers',
//     routerLink: ['./routes.ts'],
//   },
//   'catalog') 
// ];

import {
  addNavMenuSection,
  registerPageTab,
  setDashboardWidgetLayout,
} from '@vendure/admin-ui/core';
import { PendingSellersComponent } from './PendingSeller.component';

export default [
  addNavMenuSection(
    {
      id: 'pending-sellers',
      label: 'Extensions',
      items: [{
        id: 'pending-sellers',
        label: 'pending sellers',
        routerLink: ['/extensions/pending'],
        icon: 'view-list',
      }],
      },
      'catalog',
  ),
 
  setDashboardWidgetLayout([
      { id: 'metrics', width: 12 },
      { id: 'orderSummary', width: 6 },
      { id: 'pending-sellers', width: 6 },
      { id: 'latestOrders', width: 12 },
  ]),
  registerPageTab({
      location: 'seller-detail',
      route: 'pending',
      tab: 'pending-sellers',
      tabIcon: 'view-list',
      component: PendingSellersComponent,
  }),
];