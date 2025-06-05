"use client";

import React, { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useTamboThreadInput } from '@tambo-ai/react';
import { MessageInput, MessageInputTextarea, MessageInputSubmitButton, MessageInputError, MessageInputToolbar } from '@/components/ui/message-input';
import { PaymentModal } from '@/components/PaymentModal';
import { PaymentDetails } from '@/lib/payment';
import { parseX402Response } from '@/lib/x402';

export interface EnhancedMessageInputProps {
  contextKey?: string;
  className?: string;
}

export function EnhancedMessageInput({ contextKey, className }: EnhancedMessageInputProps) {
  const { address } = useAccount();
  const { value, setValue, submit } = useTamboThreadInput(contextKey);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);


  const handlePaymentSuccess = useCallback(async () => {
    setShowPaymentModal(false);

    if (pendingMessage) {
      try {
        // Submit the original message after successful payment
        setValue(pendingMessage);
        await submit({
          contextKey,
          streamResponse: true,
        });
        setValue('');
        setPendingMessage(null);
      } catch (error) {
        console.error('Error submitting message after payment:', error);
      }
    }
  }, [pendingMessage, setValue, submit, contextKey, setPendingMessage]);

  const handlePaymentError = useCallback((error: string) => {
    setShowPaymentModal(false);
    setPendingMessage(null);
    console.error('Payment error:', error);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!value.trim() || !address) return;

      try {
        await submit({
          contextKey,
          streamResponse: true,
        });
        setValue('');
      } catch (error) {
        const x402 = parseX402Response(error);
        if (x402) {
          setPendingMessage(value);
          setPaymentDetails(x402.paymentRequired);
          setShowPaymentModal(true);
        } else {
          console.error('Failed to submit message:', error);
        }
      }
    },
    [value, address, submit, contextKey, setValue]
  );

  return (
    <>
      <form onSubmit={handleSubmit}>
        <MessageInput
          contextKey={contextKey}
          className={className}
        >
          <MessageInputTextarea
            placeholder="Type your message... (Payment required for each query)"
          />
          <MessageInputToolbar>
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center space-x-2">
                {address && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Wallet connected • 0.1 USDC required per query
                  </span>
                )}
              </div>
              <MessageInputSubmitButton />
            </div>
          </MessageInputToolbar>
          <MessageInputError />
        </MessageInput>
      </form>

      {/* Payment Modal */}
      {paymentDetails && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setPendingMessage(null);
          }}
          paymentDetails={paymentDetails}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      )}
    </>
  );
}
