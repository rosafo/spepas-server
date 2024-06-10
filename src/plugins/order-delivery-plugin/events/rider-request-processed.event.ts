import { ID, RequestContext, VendureEvent } from '@vendure/core';

export class RiderRequestProcessedEvent extends VendureEvent {
  constructor(
    public ctx: RequestContext,
    public decision: String
  ) {
    super();
  }
}
