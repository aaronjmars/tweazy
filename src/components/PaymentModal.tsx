"use client";

import React, { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, Loader2, Wallet } from 'lucide-react';
import { PaymentDetails } from '@/lib/payment';
import { formatUSDCAmount } from '@/lib/payment';
import { usePayment } from '@/hooks/usePayment';
import { useAccount } from 'wagmi';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentDetails: PaymentDetails;
  onPaymentSuccess: (transactionHash: string) => void;
  onPaymentError: (error: string) => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  paymentDetails,
  onPaymentSuccess,
  onPaymentError,
}: PaymentModalProps) {
  const { address } = useAccount();
  const { state, processPayment, checkBalance, clearError } = usePayment();
  const [step, setStep] = useState<'confirm' | 'processing' | 'success' | 'error'>('confirm');

  useEffect(() => {
    if (isOpen && address) {
      checkBalance();
      setStep('confirm');
      clearError();
    }
  }, [isOpen, address, checkBalance, clearError]);

  const handlePayment = async () => {
    setStep('processing');
    
    try {
      const result = await processPayment(paymentDetails);
      
      if (result.success && result.transactionHash) {
        setStep('success');
        onPaymentSuccess(result.transactionHash);
      } else {
        setStep('error');
        onPaymentError(result.error || 'Payment failed');
      }
    } catch (error) {
      setStep('error');
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      onPaymentError(errorMessage);
    }
  };

  const handleClose = () => {
    if (step !== 'processing') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Payment Required
          </h2>
          {step !== 'processing' && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content based on step */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100">
                    Payment Required (x402)
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    {paymentDetails.description || 'Payment required to continue with your request'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatUSDCAmount(paymentDetails.amount)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Network:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  Sepolia Testnet
                </span>
              </div>

              {state.balance !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Your Balance:</span>
                  <span className={`font-medium ${
                    parseFloat(state.balance) >= parseFloat(paymentDetails.amount)
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatUSDCAmount(state.balance)}
                  </span>
                </div>
              )}
            </div>

            {state.error && (
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">{state.error}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={state.isProcessing || !address}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <Wallet className="w-4 h-4" />
                <span>Pay with USDC</span>
              </button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                Processing Payment
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Please confirm the transaction in your wallet...
              </p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                Payment Successful!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Your request is now being processed.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                Payment Failed
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {state.error || 'An error occurred while processing your payment.'}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('confirm')}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
