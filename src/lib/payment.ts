import { parseUnits, formatUnits } from 'viem';
import { writeContract, readContract, waitForTransactionReceipt } from 'wagmi/actions';
import { wagmiConfig, USDC_SEPOLIA_ADDRESS } from './wagmiConfig';
import { sepolia } from 'wagmi/chains';

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

/**
 * Check USDC balance for a given address on Sepolia
 */
export async function checkUSDCBalance(address: string): Promise<string> {
  try {
    const balance = await readContract(wagmiConfig, {
      address: USDC_SEPOLIA_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
      chainId: sepolia.id,
    });

    // USDC has 6 decimals
    return formatUnits(balance as bigint, 6);
  } catch (error) {
    console.error('Error checking USDC balance:', error);
    throw new Error('Failed to check USDC balance');
  }
}

/**
 * Transfer USDC tokens on Sepolia testnet
 */
export async function transferUSDC(
  recipient: string,
  amount: string
): Promise<PaymentResult> {
  try {
    // Convert amount to proper units (USDC has 6 decimals)
    const amountInUnits = parseUnits(amount, 6);

    // Execute the transfer
    const hash = await writeContract(wagmiConfig, {
      address: USDC_SEPOLIA_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [recipient as `0x${string}`, amountInUnits],
      chainId: sepolia.id,
    });

    // Wait for transaction confirmation
    const receipt = await waitForTransactionReceipt(wagmiConfig, {
      hash,
      chainId: sepolia.id,
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
 * Format USDC amount for display
 */
export function formatUSDCAmount(amount: string): string {
  const num = parseFloat(amount);
  return `${num.toFixed(2)} USDC`;
}
