import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { PaymentDetails, PaymentResult, checkUSDCBalance, validateSufficientBalance } from '@/lib/payment';
import { createX402PaymentHandler } from '@/lib/x402';

export interface PaymentState {
  isProcessing: boolean;
  error: string | null;
  lastPayment: PaymentResult | null;
  balance: string | null;
  isLoadingBalance: boolean;
}

export interface UsePaymentReturn {
  state: PaymentState;
  processPayment: (paymentDetails: PaymentDetails) => Promise<PaymentResult>;
  checkBalance: () => Promise<void>;
  clearError: () => void;
  validateBalance: (requiredAmount: string) => Promise<boolean>;
}

/**
 * Hook for handling USDC payments on Sepolia
 */
export function usePayment(): UsePaymentReturn {
  const { address } = useAccount();
  
  const [state, setState] = useState<PaymentState>({
    isProcessing: false,
    error: null,
    lastPayment: null,
    balance: null,
    isLoadingBalance: false,
  });

  const processPayment = useCallback(async (paymentDetails: PaymentDetails): Promise<PaymentResult> => {
    if (!address) {
      const error = 'Wallet not connected';
      setState(prev => ({ ...prev, error }));
      return { success: false, error };
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const paymentHandler = createX402PaymentHandler(address);
      const result = await paymentHandler.handlePayment(paymentDetails);
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        lastPayment: result,
        error: result.success ? null : result.error || 'Payment failed',
      }));

      // Refresh balance after payment
      if (result.success) {
        // Refresh balance in the background
        checkUSDCBalance(address).then(balance => {
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
  }, [address]);

  const checkBalance = useCallback(async (): Promise<void> => {
    if (!address) {
      setState(prev => ({ ...prev, balance: null }));
      return;
    }

    setState(prev => ({ ...prev, isLoadingBalance: true }));

    try {
      const balance = await checkUSDCBalance(address);
      setState(prev => ({ ...prev, balance, isLoadingBalance: false }));
    } catch (error) {
      console.error('Error checking balance:', error);
      setState(prev => ({
        ...prev,
        balance: null,
        isLoadingBalance: false,
        error: 'Failed to check balance',
      }));
    }
  }, [address]);

  const validateBalance = useCallback(async (requiredAmount: string): Promise<boolean> => {
    if (!address) return false;

    try {
      return await validateSufficientBalance(address, requiredAmount);
    } catch (error) {
      console.error('Error validating balance:', error);
      return false;
    }
  }, [address]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    state,
    processPayment,
    checkBalance,
    clearError,
    validateBalance,
  };
}
