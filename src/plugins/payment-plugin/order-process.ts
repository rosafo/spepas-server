import { OrderProcess } from '@vendure/core';
/**
 * Define a new "ValidatingPayment" Order state, and set up the
 * permitted transitions to/from it.
 */
export const customOrderProcess: OrderProcess<'ValidatingPayment'> = {
    transitions: {
        ArrangingPayment: {
            to: ['ValidatingPayment'],
            mergeStrategy: 'replace',
        },
        ValidatingPayment: {
            to: ['PaymentAuthorized', 'PaymentSettled', 'ArrangingAdditionalPayment'],
        },
    },
};