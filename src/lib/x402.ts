import { PaymentDetails, PaymentResult, transferUSDC, validateSufficientBalance } from './payment';

export interface X402Response {
  status: 402;
  message: string;
  paymentRequired: PaymentDetails;
  retryUrl?: string;
}

export interface X402PaymentHandler {
  handlePayment: (paymentDetails: PaymentDetails) => Promise<PaymentResult>;
  validatePayment: (transactionHash: string) => Promise<boolean>;
}

/**
 * Check if a response is an x402 (Payment Required) response
 */
export function isX402Response(response: any): response is X402Response {
  return response && response.status === 402 && response.paymentRequired;
}

/**
 * Parse x402 response from API error
 */
export function parseX402Response(error: any): X402Response | null {
  // Check if error response contains x402 information
  if (error?.response?.status === 402) {
    const data = error.response.data;
    return {
      status: 402,
      message: data.message || 'Payment required to continue',
      paymentRequired: {
        amount: data.amount || '0.1',
        recipient: data.recipient || process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT,
        description: data.description || 'Context7 MCP Search Payment',
        transactionId: data.transactionId,
      },
      retryUrl: data.retryUrl,
    };
  }

  // Check if error message contains x402 information
  if (error?.message?.includes('402') || error?.message?.includes('Payment Required')) {
    return {
      status: 402,
      message: 'Payment required to access Context7 MCP search',
      paymentRequired: {
        amount: '0.1',
        recipient: process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT || '',
        description: 'Context7 MCP Search Payment',
      },
    };
  }

  return null;
}

/**
 * Create x402 payment handler
 */
export function createX402PaymentHandler(userAddress: string): X402PaymentHandler {
  return {
    async handlePayment(paymentDetails: PaymentDetails): Promise<PaymentResult> {
      try {
        // Validate sufficient balance first
        const hasSufficientBalance = await validateSufficientBalance(
          userAddress,
          paymentDetails.amount
        );

        if (!hasSufficientBalance) {
          return {
            success: false,
            error: `Insufficient USDC balance. Required: ${paymentDetails.amount} USDC`,
          };
        }

        // Execute payment
        const result = await transferUSDC(
          paymentDetails.recipient,
          paymentDetails.amount
        );

        return result;
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Payment failed',
        };
      }
    },

    async validatePayment(transactionHash: string): Promise<boolean> {
      try {
        // In a real implementation, you would verify the transaction
        // For now, we'll assume the transaction hash indicates success
        return transactionHash.length > 0;
      } catch (error) {
        console.error('Error validating payment:', error);
        return false;
      }
    },
  };
}

/**
 * Retry request after successful payment
 */
export async function retryAfterPayment(
  originalRequest: () => Promise<any>,
  paymentResult: PaymentResult
): Promise<any> {
  if (!paymentResult.success || !paymentResult.transactionHash) {
    throw new Error('Payment was not successful');
  }

  try {
    // Add payment proof to the retry request
    const result = await originalRequest();
    return result;
  } catch (error) {
    // If retry also fails, throw the original error
    throw error;
  }
}

/**
 * Handle x402 flow for any API request
 */
export async function handleX402Flow<T>(
  apiCall: () => Promise<T>,
  userAddress: string,
  onPaymentRequired?: (paymentDetails: PaymentDetails) => Promise<boolean>
): Promise<T> {
  try {
    // Try the original request first
    return await apiCall();
  } catch (error) {
    // Check if this is an x402 response
    const x402Response = parseX402Response(error);
    
    if (!x402Response) {
      // Not a payment required error, re-throw
      throw error;
    }

    // Handle payment required
    if (onPaymentRequired) {
      const shouldProceed = await onPaymentRequired(x402Response.paymentRequired);
      if (!shouldProceed) {
        throw new Error('Payment cancelled by user');
      }
    }

    // Create payment handler and process payment
    const paymentHandler = createX402PaymentHandler(userAddress);
    const paymentResult = await paymentHandler.handlePayment(x402Response.paymentRequired);

    if (!paymentResult.success) {
      throw new Error(paymentResult.error || 'Payment failed');
    }

    // Retry the original request after successful payment
    return await retryAfterPayment(apiCall, paymentResult);
  }
}
