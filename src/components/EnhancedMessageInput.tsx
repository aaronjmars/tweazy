"use client";

import React, { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useTamboThreadInput } from '@tambo-ai/react';
import { MessageInput, MessageInputTextarea, MessageInputSubmitButton, MessageInputError, MessageInputToolbar } from '@/components/ui/message-input';
import { PaymentModal } from '@/components/PaymentModal';
import { PaymentDetails } from '@/lib/payment';

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

  const handlePaymentRequired = useCallback(async (details: PaymentDetails): Promise<boolean> => {
    setPaymentDetails(details);
    setShowPaymentModal(true);
    return true; // We'll handle the payment flow through the modal
  }, []);

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

        // Clear the pending message
        setPendingMessage(null);
      } catch (error) {
        console.error('Error submitting message after payment:', error);
      }
    }
  }, [pendingMessage, setValue, submit, contextKey]);

  const handlePaymentError = useCallback((error: string) => {
    setShowPaymentModal(false);
    setPendingMessage(null);
    console.error('Payment error:', error);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || !address) return;

    // Store the message for retry after payment
    setPendingMessage(value);

    // Always require payment for every LLM query
    const paymentDetails: PaymentDetails = {
      amount: '0.1',
      recipient: process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT || '',
      description: 'LLM Query Payment - Required for AI response',
    };

    // Show payment modal for every query
    await handlePaymentRequired(paymentDetails);
  }, [value, address, handlePaymentRequired]);

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
