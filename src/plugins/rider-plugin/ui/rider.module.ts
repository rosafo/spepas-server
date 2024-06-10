import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@vendure/admin-ui/core';
import {  PendingRidersComponent } from './PendingRiders.component';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: PendingRidersComponent,
        data: { breadcrumb: 'PendingRider' }
      }
    ])
  ],
  declarations: [PendingRidersComponent]
})


export class PendingRiderModule {}