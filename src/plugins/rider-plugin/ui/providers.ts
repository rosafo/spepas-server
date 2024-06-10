import {
  addNavMenuSection,
} from '@vendure/admin-ui/core';

export default [
  addNavMenuSection(
    {
      id: 'pending-riders',
      label: 'Extensions',
      items: [{
        id: 'pending-riders',
        label: 'Pending riders',
        routerLink: ['/extensions/pending-riders'],
        icon: 'view-list',
      }],
      },
  ),
];