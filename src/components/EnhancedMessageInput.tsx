"use client";

import React, { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useTamboThreadInput } from '@tambo-ai/react';
import { MessageInput, MessageInputTextarea, MessageInputSubmitButton, MessageInputError, MessageInputToolbar } from '@/components/ui/message-input';
import { PaymentModal } from '@/components/PaymentModal';
import { searchWithContext7, formatContext7Results } from '@/lib/context7-mcp';
import { parseX402Response, PaymentDetails } from '@/lib/x402';

export interface EnhancedMessageInputProps {
  contextKey?: string;
  className?: string;
}

export function EnhancedMessageInput({ contextKey, className }: EnhancedMessageInputProps) {
  const { address } = useAccount();
  const { value, setValue, submit, isPending, error } = useTamboThreadInput(contextKey);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [pendingSearchQuery, setPendingSearchQuery] = useState<string | null>(null);

  const handlePaymentRequired = useCallback(async (details: PaymentDetails): Promise<boolean> => {
    setPaymentDetails(details);
    setShowPaymentModal(true);
    return true; // We'll handle the payment flow through the modal
  }, []);

  const handlePaymentSuccess = useCallback(async (transactionHash: string) => {
    setShowPaymentModal(false);
    
    if (pendingSearchQuery && address) {
      try {
        // Execute the Context7 search after successful payment
        const searchResponse = await searchWithContext7(
          { query: pendingSearchQuery },
          address
        );
        
        // Format and submit the search results
        const formattedResults = formatContext7Results(searchResponse);
        
        // Add the search results to the conversation
        await submit({
          contextKey,
          streamResponse: true,
        });
        
        // Clear the pending search
        setPendingSearchQuery(null);
      } catch (error) {
        console.error('Error executing Context7 search after payment:', error);
      }
    }
  }, [pendingSearchQuery, address, submit, contextKey]);

  const handlePaymentError = useCallback((error: string) => {
    setShowPaymentModal(false);
    setPendingSearchQuery(null);
    console.error('Payment error:', error);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || !address) return;

    // Check if the message contains search intent
    const isSearchQuery = value.toLowerCase().includes('search') || 
                         value.toLowerCase().includes('find') ||
                         value.toLowerCase().includes('look up');

    if (isSearchQuery) {
      // Store the search query for after payment
      setPendingSearchQuery(value);
      
      try {
        // Attempt Context7 search which may trigger x402
        const searchResponse = await searchWithContext7(
          { query: value },
          address,
          handlePaymentRequired
        );
        
        // If successful without payment, format and submit results
        const formattedResults = formatContext7Results(searchResponse);
        setValue(formattedResults);
        await submit({
          contextKey,
          streamResponse: true,
        });
        setValue('');
      } catch (error) {
        // Check if this is an x402 error
        const x402Response = parseX402Response(error);
        if (x402Response) {
          // Payment modal will be shown via handlePaymentRequired
          return;
        }
        
        // For other errors, proceed with normal submission
        console.error('Search error:', error);
        await submit({
          contextKey,
          streamResponse: true,
        });
        setValue('');
      }
    } else {
      // Normal message submission
      await submit({
        contextKey,
        streamResponse: true,
      });
      setValue('');
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
            placeholder="Type your message... (Use 'search' to trigger Context7 MCP with payment)"
          />
          <MessageInputToolbar>
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center space-x-2">
                {address && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Wallet connected • Context7 MCP enabled
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
            setPendingSearchQuery(null);
          }}
          paymentDetails={paymentDetails}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      )}
    </>
  );
}
