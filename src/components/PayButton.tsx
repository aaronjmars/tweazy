"use client";

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useWallet } from '@/components/WalletProvider';
import { parseUnits } from 'viem';
import { writeContract, waitForTransactionReceipt } from 'wagmi/actions';
import { wagmiConfig, USDC_BASE_SEPOLIA_ADDRESS } from '@/lib/wagmiConfig';
import { baseSepolia } from 'wagmi/chains';

// ERC20 ABI for transfer function
const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

export interface PayButtonProps {
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
  text?: string;
  amount?: string;
  recipient?: string;
  disabled?: boolean;
  className?: string;
  onSuccess?: (hash: string) => void;
  onError?: (error: string) => void;
}

export function PayButton({
  contracts,
  chainId,
  capabilities,
  text = "Send & pay 1 USDC",
  amount = "1.0",
  recipient,
  disabled = false,
  className = "",
  onSuccess,
  onError,
}: PayButtonProps) {
  const { address: userAddress } = useAccount();
  const { walletType, isOnCorrectChain, switchToCorrectChain } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = useCallback(async () => {
    if (!userAddress) {
      onError?.('Please connect your wallet');
      return;
    }

    if (!isOnCorrectChain) {
      try {
        await switchToCorrectChain();
      } catch {
        onError?.('Failed to switch to correct chain');
        return;
      }
    }

    setIsProcessing(true);

    try {
      let hash: string;

      if (contracts && contracts.length > 0) {
        // Handle custom contract calls
        const contract = contracts[0];
        hash = await writeContract(wagmiConfig, {
          address: contract.address as `0x${string}`,
          abi: contract.abi,
          functionName: contract.functionName,
          args: contract.args,
          chainId: (chainId as 1 | 84532) || baseSepolia.id,
        });
      } else if (recipient) {
        // Handle USDC transfer with potential paymaster sponsorship
        const amountInUnits = parseUnits(amount, 6);
        
        // Check if paymaster is available and wallet supports it
        if (capabilities?.paymasterService && walletType === 'cdp') {
          // For CDP/Smart wallets, we'll use paymaster sponsorship
          // This would typically involve building a UserOperation and sending it to the paymaster
          // For now, we'll use the regular transfer but in a real implementation,
          // this would be where we integrate with the paymaster service
          
          try {
            // Build partial UserOperation
            const partialUserOp = {
              sender: userAddress,
              nonce: '0x0', // This should be fetched from the smart account
              callData: '0x', // This should be the encoded transfer call
              // Gas fields will be filled by paymaster
            };

            // Call paymaster service
            const response = await fetch(capabilities.paymasterService.url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ partialUserOp }),
            });

            if (!response.ok) {
              throw new Error('Paymaster sponsorship failed');
            }

            await response.json();
            
            // For now, fall back to regular transaction
            // In a full implementation, this would send the sponsored UserOperation
            hash = await writeContract(wagmiConfig, {
              address: USDC_BASE_SEPOLIA_ADDRESS,
              abi: ERC20_ABI,
              functionName: 'transfer',
              args: [recipient as `0x${string}`, amountInUnits],
              chainId: baseSepolia.id,
            });
          } catch {
            // Fall back to regular transaction
            hash = await writeContract(wagmiConfig, {
              address: USDC_BASE_SEPOLIA_ADDRESS,
              abi: ERC20_ABI,
              functionName: 'transfer',
              args: [recipient as `0x${string}`, amountInUnits],
              chainId: baseSepolia.id,
            });
          }
        } else {
          // Regular transaction without paymaster
          hash = await writeContract(wagmiConfig, {
            address: USDC_BASE_SEPOLIA_ADDRESS,
            abi: ERC20_ABI,
            functionName: 'transfer',
            args: [recipient as `0x${string}`, amountInUnits],
            chainId: baseSepolia.id,
          });
        }
      } else {
        throw new Error('No contracts or recipient specified');
      }

      // Wait for transaction confirmation
      const receipt = await waitForTransactionReceipt(wagmiConfig, {
        hash: hash as `0x${string}`,
        chainId: (chainId as 1 | 84532) || baseSepolia.id,
      });

      if (receipt.status === 'success') {
        onSuccess?.(hash);
      } else {
        onError?.('Transaction failed');
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  }, [
    userAddress,
    isOnCorrectChain,
    switchToCorrectChain,
    contracts,
    recipient,
    amount,
    chainId,
    capabilities,
    walletType,
    onSuccess,
    onError,
  ]);

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isProcessing || !userAddress}
      className={`w-full ${className}`}
    >
      {isProcessing ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Wallet className="w-4 h-4 mr-2" />
          {text}
        </>
      )}
    </Button>
  );
}
