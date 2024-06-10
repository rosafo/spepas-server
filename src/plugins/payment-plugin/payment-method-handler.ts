import {
  CancelPaymentResult,
  CancelPaymentErrorResult,
  PaymentMethodHandler,
  CreatePaymentResult,
  SettlePaymentResult,
  SettlePaymentErrorResult,
  LanguageCode,
  ACTIVE_ORDER_INPUT_FIELD_NAME
} from '@vendure/core';
import axios from 'axios';

/**
 * This PaymentMethodHandler creates the Payment in the custom "Validating"
 * state.
 */

export const hubtelPaymentHandler = new PaymentMethodHandler({
  code: 'hubtel-payment',
  description: [
    { languageCode: LanguageCode.en, value: 'Hubtel Payment Gateway' }
  ],
  args: {
    apiKey: { type: 'string' }
  },
  createPayment: async (
    ctx,
    order,
    amount,
    args,
    metadata
  ): Promise<CreatePaymentResult> => {
    try {
      const response = await axios.post(
        'https://consumer-smrmapi.hubtel.com/request-money/' +
          metadata.mobileNumber,
        {
          amount,
          title: metadata.title,
          description: metadata.description,
          clientReference: metadata.clientReference,
          callbackUrl: metadata.callbackUrl,
          cancellationUrl: metadata.cancellationUrl,
          returnUrl: metadata.returnUrl,
          logo: metadata.logo
        },
        {
          auth: {
            username: args.apiKey,
            password: ''
          }
        }
      );

      const paylinkUrl = response.data.data.paylinkUrl;

      return {
        amount: order.total,
        state: 'Authorized' as const,
        transactionId: response.data.data.paylinkId,
        metadata: {
          paylinkUrl
        }
      };
    } catch (err: any) {
      return {
        amount: order.total,
        state: 'Declined' as const,
        metadata: {
          errorMessage:
            err.response?.data.message ||
            'An error occurred while creating the payment.'
        }
      };
    }
  },
  settlePayment: async (
    ctx,
    order,
    payment,
    args
  ): Promise<SettlePaymentResult | SettlePaymentErrorResult> => {
    try {
      // Implement logic to settle the payment with Hubtel
      // This might involve making another API call to confirm the payment

      // For example:
      const response = await axios.post(
        'https://api.hubtel.com/settle-payment',
        {
          paymentId: payment.transactionId,
          apiKey: args.apiKey
        }
      );
      console.log(response);
      // Check the response and return success or failure accordingly
      if (response.data.success) {
        return { success: true };
      } else {
        return { success: false, errorMessage: response.data.error };
      }
    } catch (err) {
      // Handle errors
      return {
        success: false,
        errorMessage:
          'An error occurred while settling the payment.'
      };
    }
  },

  cancelPayment: async (
    ctx,
    order,
    payment,
    args
  ): Promise<CancelPaymentResult | CancelPaymentErrorResult> => {
    try {
      // Implement logic to cancel the payment with Hubtel
      // This might involve making another API call to cancel the payment

      // For example:
      const response = await axios.post(
        'https://api.hubtel.com/cancel-payment',
        {
          paymentId: payment.transactionId,
          apiKey: args.apiKey
        }
      );

      // Check the response and return success or failure accordingly
      if (response.data.success) {
        return { success: true };
      } else {
        return { success: false, errorMessage: response.data.error };
      }
    } catch (err) {
      // Handle errors
      return {
        success: false,
        errorMessage:
          'An error occurred while canceling the payment.'
      };
    }
  }
});
