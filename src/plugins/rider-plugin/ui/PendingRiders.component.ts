import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';

interface PendingRiders {
  id: string;
  fullName: string;
  phone: string;
  vehicleRegistrationFile: any;
  vehicleType: string;
  nationalIdCard: any;
  status: string;
}

@Component({
  selector: 'app-pending-riders',
  template: `
    <div>
      <h2>Pending Riders</h2>
      <table>
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Phone</th>
            <th>vehicle Registration File</th>
            <th>vehicle Type</th>
            <th>nationalId Card</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let rider of pendingRiders">
            <td>{{ rider.fullName }}</td>
            <td>{{ rider.phone }}</td>
            <td>{{ rider.vehicleRegistrationFile }}</td>
            <td>{{ rider.vehicleType }}</td>
            <td>{{ rider.nationalIdCard }}</td>
            <td>{{ rider.aboutShop }}</td>
            <td>{{ rider.status }}</td>
            <td>
              <button (click)="handleProcessRider(seller, 'approve')">
                Approve
              </button>
              <button (click)="handleProcessRider(seller, 'reject')">
                Reject
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th {
        border: 1px solid #ddd;
        padding: 10px;
        text-align: left;
      }
      td {
        padding: 10px;
        text-align: left;
      }
    `
  ]
})
export class PendingRidersComponent implements OnInit {
  pendingRiders: PendingRiders[] = [];

  constructor(private apollo: Apollo) {}

  ngOnInit() {
    // Fetch data from GraphQL
    this.apollo
      .watchQuery<any>({
        query: gql`
          query GetPendingRiders {
            PendingRiders {
              id
              fullName
              phone
              vehicleRegistrationFile
              vehicleType
              nationalIdCard
              status
            }
          }
        `
      })
      .valueChanges.subscribe((result) => {
        this.pendingRiders = result.data.pendingRiders;
      });
  }

  handleProcessRider(rider: PendingRiders, decision: string) {
    // Handle rider processing here
    this.apollo
      .mutate<any>({
        mutation: gql`
          mutation processRiderRequest($id: String!, $decision: String!) {
            processRiderRequest(id: $id, decision: $decision) {
              # If mutation returns any data, handle it accordingly
              message
            }
          }
        `,
        variables: { id: rider.id, decision }
      })
      .subscribe(
        (result) => {
          window.alert(`rider ${rider.id} ${decision}d successfully`);
        },
        (error) => {
          window.alert(`Error ${decision}ing rider ${rider.id}:`);
        }
      );
  }
}
