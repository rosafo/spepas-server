import { ID, RequestContext, VendureEvent } from '@vendure/core';
import { RideRequestInput } from '../types';
export class RiderRequestSubmittedEvent extends VendureEvent {
  constructor(public ctx: RequestContext, public input: RideRequestInput) {
    super();
  }
}
