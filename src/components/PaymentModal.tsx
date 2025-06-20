"use client";

import React, { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, Loader2, Wallet, Zap } from 'lucide-react';
import { PaymentDetails, PaymentContext, formatUSDCAmount } from '@/lib/payment';
import { isPaymasterSupported, BASE_SEPOLIA_CHAIN_ID } from '@/lib/wagmiConfig';
import { usePayment } from '@/hooks/usePayment';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentDetails: PaymentDetails;
  paymentContext: PaymentContext;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  paymentDetails,
  paymentContext,
  onPaymentSuccess,
  onPaymentError,
}: PaymentModalProps) {
  const { address } = useAccount();
  const { state, processPayment, checkBalance, clearError } = usePayment();
  const [step, setStep] = useState<'confirm' | 'processing' | 'success' | 'error'>('confirm');

  useEffect(() => {
    if (isOpen && paymentContext) {
      checkBalance(paymentContext);
      setStep('confirm');
      clearError();
    }
  }, [isOpen, paymentContext, checkBalance, clearError]);

  const handlePayment = async () => {
    setStep('processing');

    try {
      // Enable paymaster for CDP/Smart wallets on supported chains
      const usePaymaster = (paymentContext.walletType === 'cdp' || paymentContext.walletType === 'smart') &&
                          isPaymasterSupported(BASE_SEPOLIA_CHAIN_ID);

      if (usePaymaster) {
        // Using paymaster for gas sponsorship
      }

      const enhancedContext = {
        ...paymentContext,
        usePaymaster,
      };

      const result = await processPayment(paymentDetails, enhancedContext);

      if (result.success) {
        setStep('success');
        onPaymentSuccess();
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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="max-w-md w-full mx-4 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">
            Payment Required
          </CardTitle>
          {step !== 'processing' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
        {step === 'confirm' && (
          <>
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-foreground">
                      Payment Required
                    </h3>
                    <Badge variant="secondary" className="text-xs">x402</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {paymentDetails.description || 'Payment required to continue with your request'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 border rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium text-foreground">
                  {formatUSDCAmount(paymentDetails.amount)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network:</span>
                <Badge variant="outline" className="text-xs">
                  {paymentContext.walletType === 'cdp' ? 'Base Sepolia' : 'Base Sepolia'}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Wallet:</span>
                <div className="flex items-center gap-2">
                  <Wallet className="h-3 w-3" />
                  <span className="font-medium text-foreground">
                    {paymentContext.walletType === 'metamask' ? 'MetaMask' : 'Coinbase CDP'}
                  </span>
                  {(paymentContext.walletType === 'cdp' || paymentContext.walletType === 'smart') &&
                   isPaymasterSupported(BASE_SEPOLIA_CHAIN_ID) && (
                    <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      Gas Free
                    </Badge>
                  )}
                </div>
              </div>

              {state.balance !== null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your Balance:</span>
                  <span className={`font-medium font-mono ${
                    parseFloat(state.balance) >= parseFloat(paymentDetails.amount)
                      ? 'text-primary'
                      : 'text-destructive'
                  }`}>
                    {formatUSDCAmount(state.balance)}
                  </span>
                </div>
              )}
            </div>

            {state.error && (
              <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                <p className="text-sm text-destructive">{state.error}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                disabled={state.isProcessing || (!address && paymentContext.walletType === 'metamask')}
                className="flex-1"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Pay with {paymentContext.walletType === 'metamask' ? 'MetaMask' : 'CDP Wallet'}
              </Button>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="text-center space-y-4 py-6">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <div>
              <h3 className="font-medium text-foreground">
                Processing Payment
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {(paymentContext.walletType === 'cdp' || paymentContext.walletType === 'smart') &&
                 isPaymasterSupported(BASE_SEPOLIA_CHAIN_ID) ? (
                  <>
                    <Zap className="w-4 h-4 inline mr-1 text-green-600" />
                    Gas fees sponsored • Please confirm USDC payment in your wallet...
                  </>
                ) : (
                  'Please confirm the transaction in your wallet...'
                )}
              </p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4 py-6">
            <CheckCircle className="w-12 h-12 text-primary mx-auto" />
            <div>
              <h3 className="font-medium text-foreground">
                Payment Successful!
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your request is now being processed.
              </p>
            </div>
            <Button
              onClick={handleClose}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center space-y-4 py-6">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <div>
              <h3 className="font-medium text-foreground">
                Payment Failed
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {state.error || 'An error occurred while processing your payment.'}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setStep('confirm')}
                className="flex-1"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
}
