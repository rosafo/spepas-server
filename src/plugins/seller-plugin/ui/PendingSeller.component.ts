import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';

interface PendingSeller {
  id: string;
  fullName: string;
  emailAddress: string;
  phone: string;
  TIN: string;
  businessRegistrationFile: string;
  shopAddress: string;
  aboutShop: string;
  status: string;
}

@Component({
  selector: 'app-pending-sellers',
  template: `
    <div>
      <h2>Pending Sellers</h2>
      <table>
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Email Address</th>
            <th>Phone</th>
            <th>TIN</th>
            <th>Business Registration File</th>
            <th>Shop Address</th>
            <th>About Shop</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let seller of pendingSellers">
            <td>{{ seller.fullName }}</td>
            <td>{{ seller.emailAddress }}</td>
            <td>{{ seller.phone }}</td>
            <td>{{ seller.TIN }}</td>
            <td>{{ seller.businessRegistrationFile }}</td>
            <td>{{ seller.shopAddress }}</td>
            <td>{{ seller.aboutShop }}</td>
            <td>{{ seller.status }}</td>
            <td>
              <button (click)="handleProcessSeller(seller, 'approve')">Approve</button>
              <button (click)="handleProcessSeller(seller, 'reject')">Reject</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
  `]
})
export class PendingSellersComponent implements OnInit {
  pendingSellers: PendingSeller[] = [];

  constructor(private apollo: Apollo) {}

  ngOnInit() {
    // Fetch data from GraphQL
    this.apollo
      .watchQuery<any>({
        query: gql`
          query GetPendingSellers {
            pendingSellers {
              id
              fullName
              emailAddress
              phone
              TIN
              businessRegistrationFile
              shopAddress
              aboutShop
              status
            }
          }
        `,
      })
      .valueChanges.subscribe((result) => {
        this.pendingSellers = result.data.pendingSellers;
      });
  }

  handleProcessSeller(seller: PendingSeller, decision: string) {
    // Handle seller processing here
    this.apollo
      .mutate<any>({
        mutation: gql`
          mutation ProcessSeller($id: String!, $decision: String!) {
            processSellerRequest(id: $id, decision: $decision) {
              # If mutation returns any data, handle it accordingly
              message
            }
          }
        `,
        variables: { id: seller.id, decision },
      })
      .subscribe(
        (result) => {
          window.alert(`Seller ${seller.id} ${decision}d successfully`);
        },
        (error) => {
          window.alert(`Error ${decision}ing seller ${seller.id}:`);
        }
      );
  }
}
