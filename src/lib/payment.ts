import { parseUnits, formatUnits, isAddress, getAddress } from 'viem';
import { writeContract, readContract, waitForTransactionReceipt, switchChain } from 'wagmi/actions';
import { wagmiConfig, USDC_BASE_SEPOLIA_ADDRESS } from './wagmiConfig';
import { baseSepolia } from 'wagmi/chains';
import { cdpWalletService, CDPWalletInfo } from './cdp-wallet';
import { smartWalletService, SmartWalletInfo } from './smart-wallet';

// ERC-20 ABI for USDC transfers
const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

export interface PaymentDetails {
  amount: string; // Amount in USDC (e.g., "0.1")
  recipient: string; // Ethereum address to receive payment
  description?: string;
  transactionId?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export type WalletType = 'metamask' | 'cdp';

export interface PaymentContext {
  walletType: WalletType;
  walletInfo?: CDPWalletInfo;
  smartWalletInfo?: SmartWalletInfo;
  userAddress?: string;
}

/**
 * Check USDC balance for a given address on Base Sepolia
 */
export async function checkUSDCBalance(address: string): Promise<string> {
  try {
    // Validate and normalize the address
    if (!isAddress(address)) {
      throw new Error('Invalid address format');
    }
    const normalizedAddress = getAddress(address);

    // Ensure we're on the correct chain for balance checking
    try {
      await switchChain(wagmiConfig, { chainId: baseSepolia.id });
    } catch (switchError) {
      console.log('Chain switch not needed or failed for balance check:', switchError);
    }

    const balance = await readContract(wagmiConfig, {
      address: USDC_BASE_SEPOLIA_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [normalizedAddress],
      chainId: baseSepolia.id,
    });

    // USDC has 6 decimals
    return formatUnits(balance as bigint, 6);
  } catch (error) {
    console.error('Error checking USDC balance:', error);
    throw new Error('Failed to check USDC balance');
  }
}

/**
 * Transfer USDC tokens on Base Sepolia testnet using MetaMask
 */
export async function transferUSDC(
  recipient: string,
  amount: string
): Promise<PaymentResult> {
  try {
    // Validate and normalize the recipient address
    if (!isAddress(recipient)) {
      throw new Error('Invalid recipient address format');
    }
    const normalizedRecipient = getAddress(recipient);

    // Ensure we're on the correct chain (Base Sepolia)
    try {
      await switchChain(wagmiConfig, { chainId: baseSepolia.id });
    } catch (switchError) {
      console.log('Chain switch not needed or failed:', switchError);
      // Continue anyway - the writeContract call will handle chain switching
    }

    // Convert amount to proper units (USDC has 6 decimals)
    const amountInUnits = parseUnits(amount, 6);

    // Execute the transfer
    const hash = await writeContract(wagmiConfig, {
      address: USDC_BASE_SEPOLIA_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [normalizedRecipient, amountInUnits],
      chainId: baseSepolia.id,
    });

    // Wait for transaction confirmation
    const receipt = await waitForTransactionReceipt(wagmiConfig, {
      hash,
      chainId: baseSepolia.id,
    });

    if (receipt.status === 'success') {
      return {
        success: true,
        transactionHash: hash,
      };
    } else {
      return {
        success: false,
        error: 'Transaction failed',
      };
    }
  } catch (error) {
    console.error('Error transferring USDC:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Validate if an address has sufficient USDC balance
 */
export async function validateSufficientBalance(
  address: string,
  requiredAmount: string
): Promise<boolean> {
  try {
    const balance = await checkUSDCBalance(address);
    const balanceNum = parseFloat(balance);
    const requiredNum = parseFloat(requiredAmount);
    
    return balanceNum >= requiredNum;
  } catch (error) {
    console.error('Error validating balance:', error);
    return false;
  }
}

/**
 * Transfer USDC using CDP wallet
 */
export async function transferUSDCWithCDP(
  walletId: string,
  recipient: string,
  amount: string
): Promise<PaymentResult> {
  try {
    const result = await cdpWalletService.transferUSDC(walletId, recipient, amount);
    return result;
  } catch (error) {
    console.error('Error transferring USDC with CDP:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'CDP transfer failed',
    };
  }
}

/**
 * Universal payment function that handles both MetaMask and CDP wallets
 */
export async function makePayment(
  paymentDetails: PaymentDetails,
  paymentContext: PaymentContext
): Promise<PaymentResult> {
  switch (paymentContext.walletType) {
    case 'metamask':
      return await transferUSDC(paymentDetails.recipient, paymentDetails.amount);
    
    case 'cdp':
      // Handle both regular CDP wallets and smart wallets
      if (paymentContext.smartWalletInfo) {
        // Use smart wallet for payment
        return await smartWalletService.transferUSDC(
          paymentContext.smartWalletInfo,
          paymentDetails.recipient,
          paymentDetails.amount
        );
      } else if (paymentContext.walletInfo?.id) {
        // Use regular CDP wallet
        return await transferUSDCWithCDP(
          paymentContext.walletInfo.id,
          paymentDetails.recipient,
          paymentDetails.amount
        );
      } else {
        return {
          success: false,
          error: 'CDP wallet not found',
        };
      }
    
    default:
      return {
        success: false,
        error: 'Unsupported wallet type',
      };
  }
}

/**
 * Check balance for both wallet types
 */
export async function checkBalance(paymentContext: PaymentContext): Promise<string> {
  switch (paymentContext.walletType) {
    case 'metamask':
      if (!paymentContext.userAddress) {
        throw new Error('User address not found for MetaMask');
      }
      return await checkUSDCBalance(paymentContext.userAddress);
    
    case 'cdp':
      // Handle both regular CDP wallets and smart wallets
      if (paymentContext.smartWalletInfo) {
        return await smartWalletService.getBalance(paymentContext.smartWalletInfo);
      } else if (paymentContext.walletInfo?.id) {
        return await cdpWalletService.getBalance(paymentContext.walletInfo.id);
      } else {
        throw new Error('CDP wallet not found');
      }
    
    default:
      throw new Error('Unsupported wallet type');
  }
}

/**
 * Validate sufficient balance for both wallet types
 */
export async function validateSufficientBalanceUniversal(
  paymentContext: PaymentContext,
  requiredAmount: string
): Promise<boolean> {
  try {
    const balance = await checkBalance(paymentContext);
    const balanceNum = parseFloat(balance);
    const requiredNum = parseFloat(requiredAmount);
    
    return balanceNum >= requiredNum;
  } catch (error) {
    console.error('Error validating universal balance:', error);
    return false;
  }
}

/**
 * Format USDC amount for display
 */
export function formatUSDCAmount(amount: string): string {
  const num = parseFloat(amount);
  return `${num.toFixed(2)} USDC`;
}
