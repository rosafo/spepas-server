import { OrderPlacedStrategy, OrderState, RequestContext } from '@vendure/core';

/**
 * This OrderPlacedStrategy tells Vendure to set the Order as "placed"
 * when it transitions to the custom "ValidatingPayment" state.
 */
export class MyOrderPlacedStrategy implements OrderPlacedStrategy {
    shouldSetAsPlaced(ctx: RequestContext, fromState: OrderState, toState: OrderState): boolean | Promise<boolean> {
        return fromState === 'ArrangingPayment' && toState === ('ValidatingPayment' as any);
    }
}