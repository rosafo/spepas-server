import {
  addNavMenuSection,
} from '@vendure/admin-ui/core';

export default [
  addNavMenuSection(
    {
      id: 'pending-sellers',
      label: 'Extensions',
      items: [{
        id: 'pending-sellers',
        label: 'Pending sellers',
        routerLink: ['/extensions/pending-sellers'],
        icon: 'view-list',
      }],
      },
  ),
];