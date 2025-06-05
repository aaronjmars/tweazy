"use client";

import React, { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useTamboThreadInput } from '@tambo-ai/react';
import { MessageInput, MessageInputTextarea, MessageInputSubmitButton, MessageInputError, MessageInputToolbar } from '@/components/ui/message-input';
import { PaymentModal } from '@/components/PaymentModal';
import { parseX402Response, handleX402Flow } from '@/lib/x402';
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

    // Store the message for potential retry after payment
    setPendingMessage(value);

    try {
      // Attempt to submit the message - this could trigger x402 from any API call
      await handleX402Flow(
        async () => {
          await submit({
            contextKey,
            streamResponse: true,
          });
          setValue('');
        },
        address,
        handlePaymentRequired
      );

      // Clear pending message if successful
      setPendingMessage(null);
    } catch (error) {
      // Check if this is an x402 error
      const x402Response = parseX402Response(error);
      if (x402Response) {
        // Payment modal will be shown via handlePaymentRequired
        return;
      }

      // For other errors, proceed with normal submission
      console.error('Submit error:', error);
      await submit({
        contextKey,
        streamResponse: true,
      });
      setValue('');
      setPendingMessage(null);
    }
  }, [value, address, submit, contextKey, setValue, handlePaymentRequired]);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <MessageInput
          contextKey={contextKey}
          className={className}
        >
          <MessageInputTextarea
            placeholder="Type your message... (x402 payment support enabled)"
          />
          <MessageInputToolbar>
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center space-x-2">
                {address && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Wallet connected • x402 payment support enabled
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
