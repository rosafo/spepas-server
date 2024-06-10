import { PaymentProcess } from '@vendure/core';

/**
 * Declare your custom state in special interface to make it type-safe
 */
declare module '@vendure/core' {
    interface PaymentStates {
        Validating: never;
    }
}

/**
 * Define a new "Validating" Payment state, and set up the
 * permitted transitions to/from it.
 */
export const customPaymentProcess: PaymentProcess<'Validating'> = {
    transitions: {
        Created: {
            to: ['Validating'],
            mergeStrategy: 'replace',
        },
        Validating: {
            to: ['Settled', 'Declined', 'Cancelled'],
        },
    },
};