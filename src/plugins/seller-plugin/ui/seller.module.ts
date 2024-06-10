import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@vendure/admin-ui/core';
import {  PendingSellersComponent } from './PendingSeller.component';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: PendingSellersComponent,
        data: { breadcrumb: 'PendingSeller' }
      }
    ])
  ],
  declarations: [PendingSellersComponent]
})


export class PendingSellerModule {}