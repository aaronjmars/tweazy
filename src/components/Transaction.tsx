"use client";

import React, { ReactNode } from 'react';
import { PayButton, PayButtonProps } from './PayButton';

export interface TransactionProps {
  address?: string;
  contracts?: Array<{
    address: string;
    abi: readonly unknown[];
    functionName: string;
    args: unknown[];
  }>;
  chainId?: number;
  capabilities?: {
    paymasterService?: {
      url: string;
    };
  };
  children: ReactNode;
  onSuccess?: (hash: string) => void;
  onError?: (error: string) => void;
}

export interface TransactionButtonProps {
  text?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Transaction wrapper component that provides paymaster capabilities
 * This component mimics the @tambo-ai/react Transaction component mentioned in the PRD
 */
export function Transaction({
  address,
  contracts,
  chainId,
  capabilities,
  children,
  onSuccess,
  onError,
}: TransactionProps) {
  // Clone children and pass transaction props to TransactionButton components
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === TransactionButton) {
      return React.cloneElement(child, {
        ...(child.props as object),
        address,
        contracts,
        chainId,
        capabilities,
        onSuccess,
        onError,
      } as PayButtonProps);
    }
    return child;
  });

  return <div className="transaction-wrapper">{enhancedChildren}</div>;
}

/**
 * TransactionButton component that works within a Transaction wrapper
 */
export function TransactionButton({
  text = "Send Transaction",
  disabled,
  className,
  ...transactionProps
}: TransactionButtonProps & Partial<PayButtonProps>) {
  return (
    <PayButton
      {...transactionProps}
      text={text}
      disabled={disabled}
      className={className}
    />
  );
}

// Export both components for convenience
export { PayButton };
