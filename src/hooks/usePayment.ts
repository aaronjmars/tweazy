import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { PaymentDetails, PaymentResult, PaymentContext, checkBalance, validateSufficientBalanceUniversal, makePayment } from '@/lib/payment';

export interface PaymentState {
  isProcessing: boolean;
  error: string | null;
  lastPayment: PaymentResult | null;
  balance: string | null;
  isLoadingBalance: boolean;
}

export interface UsePaymentReturn {
  state: PaymentState;
  processPayment: (paymentDetails: PaymentDetails, paymentContext: PaymentContext) => Promise<PaymentResult>;
  checkBalance: (paymentContext: PaymentContext) => Promise<void>;
  clearError: () => void;
  validateBalance: (requiredAmount: string, paymentContext: PaymentContext) => Promise<boolean>;
}

/**
 * Hook for handling USDC payments on Sepolia
 */
export function usePayment(): UsePaymentReturn {
  const { } = useAccount();
  
  const [state, setState] = useState<PaymentState>({
    isProcessing: false,
    error: null,
    lastPayment: null,
    balance: null,
    isLoadingBalance: false,
  });

  const processPayment = useCallback(async (paymentDetails: PaymentDetails, paymentContext: PaymentContext): Promise<PaymentResult> => {
    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const result = await makePayment(paymentDetails, paymentContext);
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        lastPayment: result,
        error: result.success ? null : result.error || 'Payment failed',
      }));

      // Refresh balance after payment
      if (result.success) {
        // Refresh balance in the background
        checkBalance(paymentContext).then(balance => {
          setState(prev => ({ ...prev, balance }));
        }).catch(() => {
          // Ignore balance refresh errors
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown payment error';
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage,
        lastPayment: { success: false, error: errorMessage },
      }));

      return { success: false, error: errorMessage };
    }
  }, []);

  const checkBalanceFunc = useCallback(async (paymentContext: PaymentContext): Promise<void> => {
    setState(prev => ({ ...prev, isLoadingBalance: true }));

    try {
      const balance = await checkBalance(paymentContext);
      setState(prev => ({ ...prev, balance, isLoadingBalance: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        balance: null,
        isLoadingBalance: false,
        error: 'Failed to check balance',
      }));
    }
  }, []);

  const validateBalance = useCallback(async (requiredAmount: string, paymentContext: PaymentContext): Promise<boolean> => {
    try {
      return await validateSufficientBalanceUniversal(paymentContext, requiredAmount);
    } catch (error) {
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    state,
    processPayment,
    checkBalance: checkBalanceFunc,
    clearError,
    validateBalance,
  };
}
