"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useTamboThreadInput } from '@tambo-ai/react';
import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";
import { PaymentModal } from '@/components/PaymentModal';
import { PaymentDetails } from '@/lib/payment';

export interface EnhancedMessageInputProps {
  contextKey?: string;
  className?: string;
}

export function EnhancedMessageInput({ contextKey, className }: EnhancedMessageInputProps) {
  const { address } = useAccount();
  const { value, setValue, submit, isPending, error } = useTamboThreadInput(contextKey);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [displayValue, setDisplayValue] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Sync display value with input value
  useEffect(() => {
    setDisplayValue(value);
    if (value && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [value]);

  // Debug logging
  useEffect(() => {
    console.log('EnhancedMessageInput mounted', { 
      address, 
      contextKey, 
      recipient: process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT 
    });
  }, [address, contextKey]);

  const handlePaymentRequired = useCallback(async (details: PaymentDetails): Promise<boolean> => {
    console.log('Payment required:', details);
    setPaymentDetails(details);
    setShowPaymentModal(true);
    return true;
  }, []);

  const handlePaymentSuccess = useCallback(async () => {
    console.log('Payment successful, submitting message:', pendingMessage);
    setShowPaymentModal(false);

    if (pendingMessage) {
      try {
        setDisplayValue("");
        await submit({
          contextKey,
          streamResponse: true,
        });
        setValue('');
        setPendingMessage(null);
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 0);
      } catch (error) {
        console.error('Error submitting message after payment:', error);
        setDisplayValue(pendingMessage);
        setSubmitError('Failed to send message after payment. Please try again.');
      }
    }
  }, [pendingMessage, setValue, submit, contextKey]);

  const handlePaymentError = useCallback((error: string) => {
    console.log('Payment error:', error);
    setShowPaymentModal(false);
    setPendingMessage(null);
    setSubmitError(error);
  }, []);

  const handleEnhancedSubmit = useCallback(async (e: React.FormEvent) => {
    console.log('Enhanced submit triggered', { value, address });
    e.preventDefault();
    
    if (!value.trim()) {
      console.log('No message to submit');
      return;
    }
    
    if (!address) {
      console.log('No wallet address - wallet must be connected');
      setSubmitError('Please connect your wallet to send messages');
      return;
    }

    const recipient = process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT;
    if (!recipient) {
      console.error('No payment recipient configured');
      setSubmitError('Payment system not configured. Please check environment variables.');
      return;
    }

    setSubmitError(null);
    setPendingMessage(value);

    // Always require payment for every LLM query
    const paymentDetails: PaymentDetails = {
      amount: '0.1',
      recipient,
      description: 'LLM Query Payment - Required for AI response',
    };

    console.log('Triggering payment modal with details:', paymentDetails);
    await handlePaymentRequired(paymentDetails);
  }, [value, address, handlePaymentRequired]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    setDisplayValue(e.target.value);
    setSubmitError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (displayValue.trim()) {
        handleEnhancedSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  return (
    <>
      <form onSubmit={handleEnhancedSubmit} className={cn("w-full", className)}>
        <div className="flex flex-col border border-border rounded-xl bg-background shadow-md p-2 px-3">
          <textarea
            ref={textareaRef}
            value={displayValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="flex-1 p-3 rounded-t-lg bg-background text-foreground resize-none text-sm min-h-[82px] max-h-[40vh] focus:outline-none placeholder:text-muted-foreground/50"
            disabled={isPending}
            placeholder="Type your message... (Payment required for each query)"
            aria-label="Chat Message Input"
          />
          
          <div className="flex justify-end mt-2 p-1">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center space-x-2">
                {address && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Wallet connected • 0.1 USDC required per query
                  </span>
                )}
                {!address && (
                  <span className="text-xs text-red-500 dark:text-red-400">
                    Connect wallet to send messages
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={isPending || !displayValue.trim()}
                className="w-10 h-10 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 dark:hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center cursor-pointer"
                aria-label="Send message"
              >
                {isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <ArrowUp className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {(error || submitError) && (
            <p className="text-sm text-[hsl(var(--destructive))] mt-2">
              {error?.message ?? submitError}
            </p>
          )}
        </div>
      </form>

      {/* Payment Modal */}
      {paymentDetails && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            console.log('Payment modal closed');
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
